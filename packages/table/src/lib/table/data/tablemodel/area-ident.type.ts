/**
 * The AreaIdent is an identifier for the three areas : header, body, and footer.
 *
 * @category Area models
 */
export type AreaIdent = "header" | "body" | "footer";

/**
 * Converts a string to the identifier of type AreaIdent.
 * @param s should be "header"|"body"|"footer". The fallback return value is 'body'
 *
 * @category Area models
 */
export const getAreaIdentByString = (s: string | null): AreaIdent => {
  if (s === "header") {
    return "header";
  }
  if (s === "footer") {
    return "footer";
  }
  return "body";
};
