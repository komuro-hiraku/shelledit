import type { ShellConfig } from "../config/types.js";

/** Interface for shell config parsers */
export interface ShellParser {
  /** Parse a shell config file content into a ShellConfig */
  parse(content: string, source: string): ShellConfig;
}
