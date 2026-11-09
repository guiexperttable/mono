import type { LogLineIf } from "../../model/log-line.if";

const SOURCES = ["api", "auth", "db", "cache", "queue", "mailer", "scheduler", "billing"];
const MESSAGES: Record<LogLineIf["level"], string[]> = {
  DEBUG: ["cache lookup key=%k", "query plan cost=%n", "retry budget left=%n", "parsed %n headers"],
  INFO: ["GET /api/orders/%n 200 in %n ms", "user %k signed in", "job %k finished in %n ms", "sent %n mails",
    "POST /api/cart 201 in %n ms", "connection pool size=%n"],
  WARN: ["slow query: %n ms", "retrying request %k (%n/3)", "disk usage at %n %", "rate limit close for %k"],
  ERROR: ["timeout after %n ms calling %k", "payment %k declined", "deadlock detected, rolled back tx %k",
    "unhandled exception in handler %k"],
};

/**
 * Generates log lines with a fixed seed – the same seed gives the same lines (live data demos, since 1.1.108).
 * Levels: ~70 % INFO, 15 % DEBUG, 10 % WARN, 5 % ERROR; the time advances by `msPerLine`.
 *
 * @example
 * const generator = new LogGenerator(42);
 * const lines = generator.next(500);
 */
export class LogGenerator {
  private seed: number;
  private nextId = 1;
  private timeMs: number;

  constructor(seed = 42, startTimeMs = 8 * 3_600_000, private readonly msPerLine = 0.2) {
    this.seed = seed >>> 0 || 1;
    this.timeMs = startTimeMs;
  }

  /** The next `count` lines. */
  next(count: number): LogLineIf[] {
    const lines: LogLineIf[] = new Array(count);
    for (let i = 0; i < count; i++) {
      lines[i] = this.line();
    }
    return lines;
  }

  /** Number of lines generated so far. */
  getCount(): number {
    return this.nextId - 1;
  }

  private line(): LogLineIf {
    const r = this.random();
    const level: LogLineIf["level"] = r < 0.05 ? "ERROR" : r < 0.15 ? "WARN" : r < 0.3 ? "DEBUG" : "INFO";
    const templates = MESSAGES[level];
    const text = templates[Math.floor(this.random() * templates.length)]
      .replace(/%n/g, () => String(1 + Math.floor(this.random() * 999)))
      .replace(/%k/g, () => Math.floor(this.random() * 0xffffff).toString(16).padStart(6, "0"));
    this.timeMs += this.msPerLine;
    return {
      id: this.nextId++,
      time: formatTime(this.timeMs),
      level,
      source: SOURCES[Math.floor(this.random() * SOURCES.length)],
      text,
    };
  }

  /** mulberry32 */
  private random(): number {
    let t = (this.seed = (this.seed + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

function formatTime(ms: number): string {
  const total = Math.floor(ms);
  const h = Math.floor(total / 3_600_000) % 24;
  const m = Math.floor(total / 60_000) % 60;
  const s = Math.floor(total / 1000) % 60;
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(total % 1000, 3)}`;
}
