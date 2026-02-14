import { describe, it, expect } from "vitest";
import {
  createEmptyConfig,
  listEnvVars,
  getEnvVar,
  setEnvVar,
  removeEnvVar,
  listPathEntries,
  addPathEntry,
  removePathEntry,
  updatePathEntry,
} from "../src/config/index.js";

describe("Environment Variable Management", () => {
  it("lists env vars from config", () => {
    const config = createEmptyConfig();
    config.envVars.push(
      { name: "A", value: "1", line: 1, source: "test" },
      { name: "B", value: "2", line: 2, source: "test" },
    );
    const vars = listEnvVars(config);
    expect(vars).toHaveLength(2);
  });

  it("gets an env var by name", () => {
    const config = createEmptyConfig();
    config.envVars.push({ name: "EDITOR", value: "vim", line: 1, source: "test" });
    const v = getEnvVar(config, "EDITOR");
    expect(v?.value).toBe("vim");
  });

  it("returns undefined for missing env var", () => {
    const config = createEmptyConfig();
    expect(getEnvVar(config, "MISSING")).toBeUndefined();
  });

  it("returns last definition for duplicate env var", () => {
    const config = createEmptyConfig();
    config.envVars.push(
      { name: "EDITOR", value: "vim", line: 1, source: "test" },
      { name: "EDITOR", value: "nano", line: 5, source: "test" },
    );
    const v = getEnvVar(config, "EDITOR");
    expect(v?.value).toBe("nano");
  });

  it("sets a new env var", () => {
    const config = createEmptyConfig();
    const updated = setEnvVar(config, "NEW_VAR", "hello");
    expect(updated.envVars).toHaveLength(1);
    expect(updated.envVars[0].name).toBe("NEW_VAR");
    expect(updated.envVars[0].value).toBe("hello");
  });

  it("updates existing env var", () => {
    const config = createEmptyConfig();
    config.envVars.push({ name: "A", value: "old", line: 1, source: "test" });
    const updated = setEnvVar(config, "A", "new");
    expect(updated.envVars).toHaveLength(1);
    expect(updated.envVars[0].value).toBe("new");
  });

  it("removes env var by name", () => {
    const config = createEmptyConfig();
    config.envVars.push(
      { name: "A", value: "1", line: 1, source: "test" },
      { name: "B", value: "2", line: 2, source: "test" },
    );
    const updated = removeEnvVar(config, "A");
    expect(updated.envVars).toHaveLength(1);
    expect(updated.envVars[0].name).toBe("B");
  });

  it("removes all occurrences of duplicate env var", () => {
    const config = createEmptyConfig();
    config.envVars.push(
      { name: "A", value: "1", line: 1, source: "test" },
      { name: "A", value: "2", line: 5, source: "test" },
    );
    const updated = removeEnvVar(config, "A");
    expect(updated.envVars).toHaveLength(0);
  });

  it("does not mutate original config", () => {
    const config = createEmptyConfig();
    config.envVars.push({ name: "A", value: "1", line: 1, source: "test" });
    setEnvVar(config, "B", "2");
    expect(config.envVars).toHaveLength(1);
  });
});

describe("PATH Management", () => {
  it("lists path entries", () => {
    const config = createEmptyConfig();
    config.pathEntries.push(
      { path: "/usr/local/bin", position: "prepend", line: 1, source: "test" },
    );
    expect(listPathEntries(config)).toHaveLength(1);
  });

  it("adds a path entry with prepend", () => {
    const config = createEmptyConfig();
    const updated = addPathEntry(config, "/new/path", "prepend");
    expect(updated.pathEntries).toHaveLength(1);
    expect(updated.pathEntries[0].path).toBe("/new/path");
    expect(updated.pathEntries[0].position).toBe("prepend");
  });

  it("adds a path entry with append", () => {
    const config = createEmptyConfig();
    const updated = addPathEntry(config, "/new/path", "append");
    expect(updated.pathEntries[0].position).toBe("append");
  });

  it("removes a path entry", () => {
    const config = createEmptyConfig();
    config.pathEntries.push(
      { path: "/usr/local/bin", position: "prepend", line: 1, source: "test" },
      { path: "/opt/bin", position: "append", line: 2, source: "test" },
    );
    const updated = removePathEntry(config, "/usr/local/bin");
    expect(updated.pathEntries).toHaveLength(1);
    expect(updated.pathEntries[0].path).toBe("/opt/bin");
  });

  it("updates path entry position", () => {
    const config = createEmptyConfig();
    config.pathEntries.push(
      { path: "/usr/local/bin", position: "prepend", line: 1, source: "test" },
    );
    const updated = updatePathEntry(config, "/usr/local/bin", "append");
    expect(updated.pathEntries[0].position).toBe("append");
  });

  it("does not mutate original config", () => {
    const config = createEmptyConfig();
    addPathEntry(config, "/new/path");
    expect(config.pathEntries).toHaveLength(0);
  });
});
