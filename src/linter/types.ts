import type { ShellConfig } from "../config/types.js";

export type LintSeverity = "error" | "warning" | "info";

export interface LintMessage {
  /** Rule identifier */
  rule: string;
  /** Human-readable message */
  message: string;
  severity: LintSeverity;
  /** Line number in source file (if applicable) */
  line?: number;
  /** Source file (if applicable) */
  source?: string;
}

/** Interface for lint rules. Implement this to add new validation rules. */
export interface LintRule {
  /** Unique rule name */
  readonly name: string;
  /** Check the config and return any lint messages */
  check(config: ShellConfig): LintMessage[];
}
