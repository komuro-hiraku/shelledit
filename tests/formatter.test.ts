import { describe, it, expect } from "vitest";
import { ZshFormatter } from "../src/formatter/zsh-formatter.js";
import { BashFormatter } from "../src/formatter/bash-formatter.js";
import { FormatterRegistry } from "../src/formatter/registry.js";
import { createEmptyConfig } from "../src/config/types.js";
import type { ShellFormatter } from "../src/formatter/types.js";

describe("ZshFormatter", () => {
  const formatter = new ZshFormatter();

  it("formats env vars with export", () => {
    const config = createEmptyConfig();
    config.envVars.push({ name: "EDITOR", value: "vim", line: 1, source: "test" });
    const output = formatter.format(config);
    expect(output).toContain("export EDITOR=vim\n");
  });

  it("quotes values with spaces", () => {
    const config = createEmptyConfig();
    config.envVars.push({ name: "MSG", value: "hello world", line: 1, source: "test" });
    const output = formatter.format(config);
    expect(output).toContain('export MSG="hello world"');
  });

  it("formats PATH prepend entries", () => {
    const config = createEmptyConfig();
    config.pathEntries.push({
      path: "/usr/local/bin",
      position: "prepend",
      line: 1,
      source: "test",
    });
    const output = formatter.format(config);
    expect(output).toContain('export PATH="/usr/local/bin:$PATH"');
  });

  it("formats PATH append entries", () => {
    const config = createEmptyConfig();
    config.pathEntries.push({
      path: "/opt/bin",
      position: "append",
      line: 1,
      source: "test",
    });
    const output = formatter.format(config);
    expect(output).toContain('export PATH="$PATH:/opt/bin"');
  });

  it("includes raw lines", () => {
    const config = createEmptyConfig();
    config.rawLines.push({ content: "# comment", line: 1, source: "test" });
    config.rawLines.push({ content: 'alias ll="ls -la"', line: 2, source: "test" });
    const output = formatter.format(config);
    expect(output).toContain("# comment\n");
    expect(output).toContain('alias ll="ls -la"');
  });
});

describe("BashFormatter", () => {
  const formatter = new BashFormatter();

  it("formats PATH using ${PATH} syntax", () => {
    const config = createEmptyConfig();
    config.pathEntries.push({
      path: "/usr/local/bin",
      position: "prepend",
      line: 1,
      source: "test",
    });
    const output = formatter.format(config);
    expect(output).toContain('export PATH="/usr/local/bin:${PATH}"');
  });

  it("formats PATH append with ${PATH}", () => {
    const config = createEmptyConfig();
    config.pathEntries.push({
      path: "/opt/bin",
      position: "append",
      line: 1,
      source: "test",
    });
    const output = formatter.format(config);
    expect(output).toContain('export PATH="${PATH}:/opt/bin"');
  });
});

describe("FormatterRegistry", () => {
  it("has zsh and bash built in", () => {
    const reg = new FormatterRegistry();
    expect(reg.listFormats()).toContain("zsh");
    expect(reg.listFormats()).toContain("bash");
  });

  it("defaults to zsh", () => {
    const reg = new FormatterRegistry();
    expect(reg.getDefaultFormat()).toBe("zsh");
  });

  it("gets formatter by name", () => {
    const reg = new FormatterRegistry();
    const f = reg.get("bash");
    expect(f.name).toBe("bash");
  });

  it("gets default formatter when no name given", () => {
    const reg = new FormatterRegistry();
    const f = reg.get();
    expect(f.name).toBe("zsh");
  });

  it("throws on unknown format", () => {
    const reg = new FormatterRegistry();
    expect(() => reg.get("fish")).toThrow(/Unknown format/);
  });

  it("allows registering custom formatter", () => {
    const reg = new FormatterRegistry();
    const custom: ShellFormatter = {
      name: "fish",
      format: () => "# fish format\n",
    };
    reg.register(custom);
    expect(reg.listFormats()).toContain("fish");
    expect(reg.get("fish").name).toBe("fish");
  });

  it("allows changing default format", () => {
    const reg = new FormatterRegistry();
    reg.setDefaultFormat("bash");
    expect(reg.getDefaultFormat()).toBe("bash");
    expect(reg.get().name).toBe("bash");
  });
});
