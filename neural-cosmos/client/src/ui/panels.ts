/** Which secondary sheet (if any) is open. Inspector + Atlas are store-driven. */
export type Panel =
  | "none"
  | "legend"
  | "add"
  | "nodes"
  | "docs"
  | "history"
  | "settings";
