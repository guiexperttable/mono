/** A task of the priority list demo (row drag, since 1.1.95). */
export interface TaskIf {
  id: number;
  title: string;
  owner: string;
  status: "todo" | "doing" | "done";
  estimate: number;
  locked?: boolean;
}
