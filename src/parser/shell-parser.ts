import type { ShellParser } from "./types.js";
import type { ShellConfig, EnvVar, PathEntry, RawLine } from "../config/types.js";
import { createEmptyConfig } from "../config/types.js";

/**
 * Parser for POSIX-compatible shell configs (works for both bash and zsh).
 *
 * Handles:
 *   - export VAR=value / export VAR="value" / export VAR='value'
 *   - VAR=value (without export)
 *   - PATH manipulation: export PATH="...:$PATH" / export PATH="$PATH:..."
 *   - Comments and blank lines preserved as raw lines
 */
export class ShellConfigParser implements ShellParser {
  parse(content: string, source: string): ShellConfig {
    const config = createEmptyConfig();
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and comments — keep them as raw lines
      if (trimmed === "" || trimmed.startsWith("#")) {
        config.rawLines.push({ content: line, line: lineNum, source });
        continue;
      }

      // Try to parse as PATH assignment
      const pathResult = this.parsePathAssignment(trimmed, lineNum, source);
      if (pathResult) {
        config.pathEntries.push(pathResult);
        continue;
      }

      // Try to parse as env var assignment
      const envResult = this.parseEnvAssignment(trimmed, lineNum, source);
      if (envResult) {
        config.envVars.push(envResult);
        continue;
      }

      // Everything else is a raw line
      config.rawLines.push({ content: line, line: lineNum, source });
    }

    return config;
  }

  /**
   * Parse a PATH assignment line.
   * Handles patterns like:
   *   export PATH="/usr/local/bin:$PATH"
   *   export PATH="$PATH:/usr/local/bin"
   *   PATH="/usr/local/bin:$PATH"
   */
  private parsePathAssignment(
    line: string,
    lineNum: number,
    source: string,
  ): PathEntry | null {
    // Match: (export )? PATH = value
    const match = line.match(
      /^(?:export\s+)?PATH\s*=\s*(.+)$/,
    );
    if (!match) return null;

    const rawValue = this.unquote(match[1]);

    // Detect prepend: /some/path:$PATH
    const prependMatch = rawValue.match(
      /^(.+?):\$\{?PATH\}?$/,
    );
    if (prependMatch) {
      return {
        path: prependMatch[1],
        position: "prepend",
        line: lineNum,
        source,
      };
    }

    // Detect append: $PATH:/some/path
    const appendMatch = rawValue.match(
      /^\$\{?PATH\}?:(.+)$/,
    );
    if (appendMatch) {
      return {
        path: appendMatch[1],
        position: "append",
        line: lineNum,
        source,
      };
    }

    // Full PATH override (no $PATH reference) — treat as raw line
    return null;
  }

  /**
   * Parse an environment variable assignment.
   * Handles patterns like:
   *   export VAR=value
   *   export VAR="value with spaces"
   *   export VAR='value'
   *   VAR=value
   */
  private parseEnvAssignment(
    line: string,
    lineNum: number,
    source: string,
  ): EnvVar | null {
    const match = line.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/,
    );
    if (!match) return null;

    const name = match[1];
    // Skip PATH — handled separately
    if (name === "PATH") return null;

    const value = this.unquote(match[2]);

    return { name, value, line: lineNum, source };
  }

  /** Remove surrounding quotes from a value */
  private unquote(value: string): string {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }
}
