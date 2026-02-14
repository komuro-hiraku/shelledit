import { describe, it, expect } from "vitest";
import { ShellConfigParser } from "../src/parser/shell-parser.js";

const parser = new ShellConfigParser();

describe("ShellConfigParser", () => {
  it("parses export VAR=value", () => {
    const config = parser.parse('export EDITOR="vim"', "test");
    expect(config.envVars).toHaveLength(1);
    expect(config.envVars[0].name).toBe("EDITOR");
    expect(config.envVars[0].value).toBe("vim");
  });

  it("parses VAR=value without export", () => {
    const config = parser.parse("MY_VAR=hello", "test");
    expect(config.envVars).toHaveLength(1);
    expect(config.envVars[0].name).toBe("MY_VAR");
    expect(config.envVars[0].value).toBe("hello");
  });

  it("parses single-quoted values", () => {
    const config = parser.parse("export FOO='bar baz'", "test");
    expect(config.envVars[0].value).toBe("bar baz");
  });

  it("parses unquoted values", () => {
    const config = parser.parse("export NUM=42", "test");
    expect(config.envVars[0].value).toBe("42");
  });

  it("parses PATH prepend", () => {
    const config = parser.parse(
      'export PATH="/usr/local/bin:$PATH"',
      "test",
    );
    expect(config.pathEntries).toHaveLength(1);
    expect(config.pathEntries[0].path).toBe("/usr/local/bin");
    expect(config.pathEntries[0].position).toBe("prepend");
    expect(config.envVars).toHaveLength(0);
  });

  it("parses PATH append", () => {
    const config = parser.parse(
      'export PATH="$PATH:/opt/bin"',
      "test",
    );
    expect(config.pathEntries).toHaveLength(1);
    expect(config.pathEntries[0].path).toBe("/opt/bin");
    expect(config.pathEntries[0].position).toBe("append");
  });

  it("parses PATH with ${PATH} syntax", () => {
    const config = parser.parse(
      'export PATH="/usr/local/bin:${PATH}"',
      "test",
    );
    expect(config.pathEntries).toHaveLength(1);
    expect(config.pathEntries[0].path).toBe("/usr/local/bin");
    expect(config.pathEntries[0].position).toBe("prepend");
  });

  it("preserves comments as raw lines", () => {
    const config = parser.parse("# This is a comment", "test");
    expect(config.rawLines).toHaveLength(1);
    expect(config.rawLines[0].content).toBe("# This is a comment");
    expect(config.envVars).toHaveLength(0);
  });

  it("preserves empty lines as raw lines", () => {
    const config = parser.parse("", "test");
    expect(config.rawLines).toHaveLength(1);
    expect(config.rawLines[0].content).toBe("");
  });

  it("preserves non-assignment lines as raw lines", () => {
    const config = parser.parse('alias ll="ls -la"', "test");
    expect(config.rawLines).toHaveLength(1);
    expect(config.envVars).toHaveLength(0);
  });

  it("tracks correct line numbers", () => {
    const input = `# comment
export A=1

export B=2
export PATH="/bin:$PATH"`;
    const config = parser.parse(input, "test");
    expect(config.envVars[0].line).toBe(2);
    expect(config.envVars[1].line).toBe(4);
    expect(config.pathEntries[0].line).toBe(5);
    expect(config.rawLines[0].line).toBe(1); // comment
    expect(config.rawLines[1].line).toBe(3); // empty line
  });

  it("parses a full config file", () => {
    const input = `# My shell config
export EDITOR="vim"
export LANG=en_US.UTF-8
export PATH="/usr/local/bin:$PATH"
export PATH="$PATH:/opt/bin"
alias grep="grep --color=auto"`;
    const config = parser.parse(input, "myfile");

    expect(config.envVars).toHaveLength(2);
    expect(config.pathEntries).toHaveLength(2);
    expect(config.rawLines).toHaveLength(2);

    expect(config.envVars[0].source).toBe("myfile");
    expect(config.pathEntries[0].source).toBe("myfile");
  });
});
