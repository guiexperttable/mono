import type { AppendRowsResultIf, TableApi } from "@guiexpert/table";
import type { LogLineIf } from "../../model/log-line.if";
import { LogGenerator } from "./log-generator";

/** Numbers of a running {@link LogTailController} – reported about four times per second. */
export interface LogTailStatsIf {
  /** lines generated so far */
  totalLines: number;
  /** lines in the table now (ring buffer) */
  rowCount: number;
  /** lines per second (measured) */
  linesPerSecond: number;
  /** animation frames per second */
  fps: number;
  /** median time of `appendRows` incl. its render pass over the last second, ms */
  msPerUpdate: number;
  /** lines that came in below the view while it did not follow ("+N new lines") */
  newBelow: number;
  /** lines waiting while the intake is paused */
  pending: number;
  frozen: boolean;
  intakePaused: boolean;
  following: boolean;
}

export interface LogTailControllerOptionsIf {
  /** lines per second, default 500 */
  rate?: number;
  /** ring buffer size, default 1,000,000 */
  maxRows?: number;
  /** seed of the {@link LogGenerator}, default 42 */
  seed?: number;
  /** called about four times per second */
  onStats?: (stats: LogTailStatsIf) => void;
  /** where the lines come from (default: a {@link LogGenerator}) */
  source?: (count: number) => LogLineIf[];
}

/**
 * Drives a live log table (since 1.1.108) – the shared logic of the showcase `logtail`, `apps/table-demo/log-tail.html`
 * and the specs. Per animation frame: the lines that are due at `rate` go to a buffer, then **one**
 * `tableApi.appendRows(buffer, { follow, maxRows })`.
 *
 * - **Freeze scroll** (`setFreezeScroll(true)`): `follow: false` – the view stays where it is, even at the end; lines keep
 *   coming ("+N new lines").
 * - **Scroll to end** (`scrollToEnd()`): unfreezes and jumps to the end; from then on `follow: "auto"` follows again –
 *   also when the user scrolls to the end by hand.
 * - **Pause intake** (`setIntakePaused(true)`): the app pattern "freeze" – lines are collected, nothing is appended;
 *   unpausing appends the whole block at once.
 *
 * @example
 * const live = new LogTailController(tableApi, { rate: 5_000, maxRows: 1_000_000, onStats: s => show(s) });
 * live.start();
 * freezeButton.onclick = () => live.setFreezeScroll(!live.isFrozen());
 * endButton.onclick = () => live.scrollToEnd();
 */
export class LogTailController {
  private readonly generator: LogGenerator;
  private readonly source: (count: number) => LogLineIf[];
  private rate: number;
  private readonly maxRows: number;
  private readonly pending: LogLineIf[] = [];
  private frozen = false;
  private intakePaused = false;
  private following = true;
  private newBelow = 0;
  private running = false;
  private frameId = 0;
  private lastTime = 0;
  private due = 0;
  // stats of the current second
  private statsStart = 0;
  private statsFrames = 0;
  private statsLines = 0;
  private statsTimes: number[] = [];
  private lastStats?: LogTailStatsIf;

  constructor(private readonly tableApi: TableApi, private readonly options: LogTailControllerOptionsIf = {}) {
    this.generator = new LogGenerator(options.seed ?? 42);
    this.source = options.source ?? (count => this.generator.next(count));
    this.rate = options.rate ?? 500;
    this.maxRows = options.maxRows ?? 1_000_000;
  }

  /** Starts the frame loop. */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.statsStart = this.lastTime;
    this.frameId = requestAnimationFrame(t => this.frame(t));
  }

  /** Stops the frame loop (lines in the buffer stay). */
  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  isRunning(): boolean {
    return this.running;
  }

  /** Lines per second. */
  setRate(linesPerSecond: number): void {
    this.rate = Math.max(0, linesPerSecond);
  }

  getRate(): number {
    return this.rate;
  }

  /** Freeze scroll: the view stays where it is, lines keep coming. */
  setFreezeScroll(frozen: boolean): void {
    this.frozen = frozen;
    if (frozen) this.following = false;
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  /** Pause intake (app pattern "freeze"): lines are buffered and appended as one block when unpaused. */
  setIntakePaused(paused: boolean): void {
    this.intakePaused = paused;
    if (!paused) this.flush();
  }

  isIntakePaused(): boolean {
    return this.intakePaused;
  }

  /** Unfreezes and jumps to the end – the view follows again. */
  scrollToEnd(): void {
    this.frozen = false;
    this.following = true;
    this.newBelow = 0;
    this.tableApi.repaintHard({ py: Number.MAX_SAFE_INTEGER });
  }

  /** Appends the buffered lines now (one `appendRows`) – also used by the frame loop. */
  flush(): AppendRowsResultIf | false | undefined {
    if (this.intakePaused || !this.pending.length) return undefined;
    const lines = this.pending.splice(0, this.pending.length);
    const start = performance.now();
    const result = this.tableApi.appendRows(lines, { follow: this.frozen ? false : "auto", maxRows: this.maxRows });
    this.statsTimes.push(performance.now() - start);
    if (result) {
      this.following = result.following;
      this.newBelow = result.following ? 0 : this.newBelow + result.shown;
    }
    return result;
  }

  /** Adds lines from outside (e.g. a WebSocket) – appended with the next frame. */
  push(lines: LogLineIf[]): void {
    for (const line of lines) this.pending.push(line); // a loop: push(...lines) overflows the call stack
  }

  /** The latest numbers (also passed to `onStats`). */
  getStats(): LogTailStatsIf {
    return this.lastStats ?? this.createStats(0, 0, 0);
  }

  private frame(time: number): void {
    if (!this.running) return;
    const dt = Math.min(1_000, time - this.lastTime);
    this.lastTime = time;
    this.due += this.rate * dt / 1000;
    const count = Math.floor(this.due);
    if (count > 0) {
      this.due -= count;
      this.push(this.source(count));
      this.statsLines += count;
    }
    this.flush();
    this.statsFrames++;
    if (time - this.statsStart >= 250) {
      const seconds = (time - this.statsStart) / 1000;
      const sorted = [...this.statsTimes].sort((a, b) => a - b);
      const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
      this.lastStats = this.createStats(this.statsLines / seconds, this.statsFrames / seconds, median);
      this.options.onStats?.(this.lastStats);
      this.statsStart = time;
      this.statsFrames = 0;
      this.statsLines = 0;
      this.statsTimes = [];
    }
    this.frameId = requestAnimationFrame(t => this.frame(t));
  }

  private createStats(linesPerSecond: number, fps: number, msPerUpdate: number): LogTailStatsIf {
    return {
      totalLines: this.generator.getCount(),
      rowCount: this.tableApi.getBodyModel().getRowCount(),
      linesPerSecond: Math.round(linesPerSecond),
      fps: Math.round(fps),
      msPerUpdate,
      newBelow: this.newBelow,
      pending: this.pending.length,
      frozen: this.frozen,
      intakePaused: this.intakePaused,
      following: this.following,
    };
  }
}
