import type { LintRule, LintMessage } from "../types.js";
import type { ShellConfig } from "../../config/types.js";

/** Detects duplicate PATH entries */
export class DuplicatePathRule implements LintRule {
  readonly name = "duplicate-path";

  check(config: ShellConfig): LintMessage[] {
    const messages: LintMessage[] = [];
    const seen = new Map<string, number[]>();

    for (const entry of config.pathEntries) {
      const lines = seen.get(entry.path) ?? [];
      lines.push(entry.line);
      seen.set(entry.path, lines);
    }

    for (const [path, lines] of seen) {
      if (lines.length > 1) {
        messages.push({
          rule: this.name,
          message: `PATH entry "${path}" is added ${lines.length} times (lines: ${lines.join(", ")})`,
          severity: "warning",
          line: lines[lines.length - 1],
        });
      }
    }

    return messages;
  }
}
