import type { ShellConfig } from "../config/types.js";
import type { LintRule, LintMessage } from "./types.js";
import { DuplicateEnvRule } from "./rules/duplicate-env.js";
import { ContradictoryEnvRule } from "./rules/contradictory-env.js";
import { DuplicatePathRule } from "./rules/duplicate-path.js";
import { EmptyValueRule } from "./rules/empty-value.js";

export type { LintRule, LintMessage, LintSeverity } from "./types.js";

/** Linter that runs a set of rules against a ShellConfig */
export class Linter {
  private rules: LintRule[] = [];

  constructor() {
    // Register built-in rules
    this.addRule(new DuplicateEnvRule());
    this.addRule(new ContradictoryEnvRule());
    this.addRule(new DuplicatePathRule());
    this.addRule(new EmptyValueRule());
  }

  /** Add a custom lint rule */
  addRule(rule: LintRule): void {
    this.rules.push(rule);
  }

  /** Run all rules against the config */
  lint(config: ShellConfig): LintMessage[] {
    const messages: LintMessage[] = [];
    for (const rule of this.rules) {
      messages.push(...rule.check(config));
    }
    return messages;
  }

  /** List registered rule names */
  listRules(): string[] {
    return this.rules.map((r) => r.name);
  }
}
