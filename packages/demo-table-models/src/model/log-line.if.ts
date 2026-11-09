/** One line of a log file (live data demos, since 1.1.108). */
export interface LogLineIf {
  /** running number, unique */
  id: number;
  /** "HH:MM:SS.mmm" */
  time: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  /** the service that wrote the line */
  source: string;
  text: string;
}
