import type { ShellFormatter } from "./types.js";
import { ZshFormatter } from "./zsh-formatter.js";
import { BashFormatter } from "./bash-formatter.js";

/**
 * Registry for output formatters.
 * New formats can be registered at runtime via `register()`.
 */
export class FormatterRegistry {
  private formatters = new Map<string, ShellFormatter>();
  private defaultFormat: string;

  constructor(defaultFormat: string = "zsh") {
    this.defaultFormat = defaultFormat;
    // Register built-in formatters
    this.register(new ZshFormatter());
    this.register(new BashFormatter());
  }

  /** Register a new formatter */
  register(formatter: ShellFormatter): void {
    this.formatters.set(formatter.name, formatter);
  }

  /** Get a formatter by name */
  get(name?: string): ShellFormatter {
    const formatName = name ?? this.defaultFormat;
    const formatter = this.formatters.get(formatName);
    if (!formatter) {
      const available = this.listFormats().join(", ");
      throw new Error(
        `Unknown format: "${formatName}". Available formats: ${available}`,
      );
    }
    return formatter;
  }

  /** List all registered format names */
  listFormats(): string[] {
    return Array.from(this.formatters.keys());
  }

  /** Get the default format name */
  getDefaultFormat(): string {
    return this.defaultFormat;
  }

  /** Set the default format */
  setDefaultFormat(name: string): void {
    if (!this.formatters.has(name)) {
      throw new Error(`Unknown format: "${name}"`);
    }
    this.defaultFormat = name;
  }
}
