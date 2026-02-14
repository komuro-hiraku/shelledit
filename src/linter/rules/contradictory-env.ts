import type { LintRule, LintMessage } from "../types.js";
import type { ShellConfig } from "../../config/types.js";

/** Detects environment variables defined multiple times with different values */
export class ContradictoryEnvRule implements LintRule {
  readonly name = "contradictory-env";

  check(config: ShellConfig): LintMessage[] {
    const messages: LintMessage[] = [];
    const definitions = new Map<string, { value: string; line: number }[]>();

    for (const env of config.envVars) {
      const defs = definitions.get(env.name) ?? [];
      defs.push({ value: env.value, line: env.line });
      definitions.set(env.name, defs);
    }

    for (const [name, defs] of definitions) {
      if (defs.length < 2) continue;

      const uniqueValues = new Set(defs.map((d) => d.value));
      if (uniqueValues.size > 1) {
        const details = defs
          .map((d) => `line ${d.line}: "${d.value}"`)
          .join(", ");
        messages.push({
          rule: this.name,
          message: `Environment variable "${name}" has contradictory values: ${details}`,
          severity: "error",
          line: defs[defs.length - 1].line,
        });
      }
    }

    return messages;
  }
}
