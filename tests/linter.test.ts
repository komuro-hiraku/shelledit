import { describe, it, expect } from "vitest";
import { Linter } from "../src/linter/index.js";
import { createEmptyConfig } from "../src/config/types.js";

describe("Linter", () => {
  const linter = new Linter();

  it("returns no messages for clean config", () => {
    const config = createEmptyConfig();
    config.envVars.push({ name: "A", value: "1", line: 1, source: "test" });
    const messages = linter.lint(config);
    expect(messages).toHaveLength(0);
  });

  it("detects duplicate env vars", () => {
    const config = createEmptyConfig();
    config.envVars.push(
      { name: "A", value: "1", line: 1, source: "test" },
      { name: "A", value: "1", line: 5, source: "test" },
    );
    const messages = linter.lint(config);
    const dup = messages.find((m) => m.rule === "duplicate-env");
    expect(dup).toBeDefined();
    expect(dup!.severity).toBe("warning");
    expect(dup!.message).toContain('"A"');
  });

  it("detects contradictory env vars", () => {
    const config = createEmptyConfig();
    config.envVars.push(
      { name: "EDITOR", value: "vim", line: 1, source: "test" },
      { name: "EDITOR", value: "nano", line: 5, source: "test" },
    );
    const messages = linter.lint(config);
    const contra = messages.find((m) => m.rule === "contradictory-env");
    expect(contra).toBeDefined();
    expect(contra!.severity).toBe("error");
    expect(contra!.message).toContain("contradictory");
  });

  it("does not flag same-value duplicates as contradictory", () => {
    const config = createEmptyConfig();
    config.envVars.push(
      { name: "A", value: "same", line: 1, source: "test" },
      { name: "A", value: "same", line: 5, source: "test" },
    );
    const messages = linter.lint(config);
    const contra = messages.find((m) => m.rule === "contradictory-env");
    expect(contra).toBeUndefined();
    // Still flagged as duplicate
    const dup = messages.find((m) => m.rule === "duplicate-env");
    expect(dup).toBeDefined();
  });

  it("detects duplicate PATH entries", () => {
    const config = createEmptyConfig();
    config.pathEntries.push(
      { path: "/usr/local/bin", position: "prepend", line: 1, source: "test" },
      { path: "/usr/local/bin", position: "prepend", line: 5, source: "test" },
    );
    const messages = linter.lint(config);
    const dup = messages.find((m) => m.rule === "duplicate-path");
    expect(dup).toBeDefined();
    expect(dup!.severity).toBe("warning");
  });

  it("detects empty env var values", () => {
    const config = createEmptyConfig();
    config.envVars.push({ name: "EMPTY", value: "", line: 1, source: "test" });
    const messages = linter.lint(config);
    const empty = messages.find((m) => m.rule === "empty-value");
    expect(empty).toBeDefined();
    expect(empty!.severity).toBe("info");
  });

  it("lists registered rules", () => {
    const rules = linter.listRules();
    expect(rules).toContain("duplicate-env");
    expect(rules).toContain("contradictory-env");
    expect(rules).toContain("duplicate-path");
    expect(rules).toContain("empty-value");
  });

  it("supports custom rules", () => {
    const customLinter = new Linter();
    customLinter.addRule({
      name: "custom-rule",
      check: () => [
        {
          rule: "custom-rule",
          message: "Custom check failed",
          severity: "warning",
        },
      ],
    });
    const config = createEmptyConfig();
    const messages = customLinter.lint(config);
    const custom = messages.find((m) => m.rule === "custom-rule");
    expect(custom).toBeDefined();
  });
});
