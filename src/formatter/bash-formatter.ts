import type { ShellFormatter } from "./types.js";
import type { ShellConfig } from "../config/types.js";

/** Formats config as bash-compatible output */
export class BashFormatter implements ShellFormatter {
  readonly name = "bash";

  format(config: ShellConfig): string {
    const lines: string[] = [];

    // Environment variables
    if (config.envVars.length > 0) {
      for (const env of config.envVars) {
        const value = this.needsQuoting(env.value) ? `"${env.value}"` : env.value;
        lines.push(`export ${env.name}=${value}`);
      }
    }

    // PATH entries
    if (config.pathEntries.length > 0) {
      if (lines.length > 0) lines.push("");
      for (const entry of config.pathEntries) {
        if (entry.position === "prepend") {
          lines.push(`export PATH="${entry.path}:\${PATH}"`);
        } else {
          lines.push(`export PATH="\${PATH}:${entry.path}"`);
        }
      }
    }

    // Raw lines
    if (config.rawLines.length > 0) {
      if (lines.length > 0) lines.push("");
      for (const raw of config.rawLines) {
        lines.push(raw.content);
      }
    }

    return lines.join("\n") + "\n";
  }

  private needsQuoting(value: string): boolean {
    return /[\s$`"\\!#&|;()<>]/.test(value) || value === "";
  }
}
