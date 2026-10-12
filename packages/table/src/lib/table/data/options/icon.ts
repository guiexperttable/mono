import { IconIf } from "./icon.if";

/** @category Options */
export class Icon implements IconIf {
  constructor(
    public content: string = ">",
    public style: string = "",
    public classes: string[] = []
  ) {
  }
}
