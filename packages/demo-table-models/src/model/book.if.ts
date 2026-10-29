/** A book of the cover grid demo (`createCoverGridModelAndOptions`). */
export interface BookIf {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  /** Base hue (0…359) of the generated cover. */
  hue: number;
}
