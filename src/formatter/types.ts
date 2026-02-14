import type { ShellConfig } from "../config/types.js";

/** Interface for output formatters. Implement this to add new shell format support. */
export interface ShellFormatter {
  /** Unique identifier for this format (e.g. "zsh", "bash") */
  readonly name: string;
  /** Format a ShellConfig into a shell config file string */
  format(config: ShellConfig): string;
}
