import type { LintRule, LintMessage } from "../types.js";
import type { ShellConfig } from "../../config/types.js";

/** Detects environment variables that are defined multiple times */
export class DuplicateEnvRule implements LintRule {
  readonly name = "duplicate-env";

  check(config: ShellConfig): LintMessage[] {
    const messages: LintMessage[] = [];
    const seen = new Map<string, number[]>();

    for (const env of config.envVars) {
      const lines = seen.get(env.name) ?? [];
      lines.push(env.line);
      seen.set(env.name, lines);
    }

    for (const [name, lines] of seen) {
      if (lines.length > 1) {
        messages.push({
          rule: this.name,
          message: `Environment variable "${name}" is defined ${lines.length} times (lines: ${lines.join(", ")})`,
          severity: "warning",
          line: lines[lines.length - 1],
        });
      }
    }

    return messages;
  }
}
