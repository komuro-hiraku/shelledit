import type { LintRule, LintMessage } from "../types.js";
import type { ShellConfig } from "../../config/types.js";

/** Detects environment variables with empty values */
export class EmptyValueRule implements LintRule {
  readonly name = "empty-value";

  check(config: ShellConfig): LintMessage[] {
    const messages: LintMessage[] = [];

    for (const env of config.envVars) {
      if (env.value === "") {
        messages.push({
          rule: this.name,
          message: `Environment variable "${env.name}" has an empty value`,
          severity: "info",
          line: env.line,
          source: env.source,
        });
      }
    }

    return messages;
  }
}
