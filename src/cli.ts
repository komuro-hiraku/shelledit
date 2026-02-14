import { Command } from "commander";
import * as fs from "node:fs";
import * as path from "node:path";
import { ShellConfigParser } from "./parser/index.js";
import {
  listEnvVars,
  getEnvVar,
  setEnvVar,
  removeEnvVar,
  listPathEntries,
  addPathEntry,
  removePathEntry,
  createEmptyConfig,
} from "./config/index.js";
import type { ShellConfig } from "./config/index.js";
import { FormatterRegistry } from "./formatter/index.js";
import { Linter } from "./linter/index.js";

const parser = new ShellConfigParser();
const registry = new FormatterRegistry("zsh");
const linter = new Linter();

/** Resolve a file path to absolute */
function resolveFile(filePath: string): string {
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(process.cwd(), filePath);
}

/** Load and parse a shell config file */
function loadConfig(filePath: string): ShellConfig {
  const resolved = resolveFile(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: File not found: ${resolved}`);
    process.exit(1);
  }
  const content = fs.readFileSync(resolved, "utf-8");
  return parser.parse(content, resolved);
}

/** Save config to file in the specified format */
function saveConfig(
  config: ShellConfig,
  filePath: string,
  format?: string,
): void {
  const resolved = resolveFile(filePath);
  const formatter = registry.get(format);
  const output = formatter.format(config);
  fs.writeFileSync(resolved, output, "utf-8");
  console.log(`Config saved to ${resolved} (format: ${formatter.name})`);
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name("shelledit")
    .description("CLI tool for managing and editing zsh/bash shell configurations")
    .version("1.0.0");

  // --- load command ---
  program
    .command("load")
    .description("Load and display parsed shell config")
    .argument("<file>", "Shell config file to load")
    .action((file: string) => {
      const config = loadConfig(file);
      console.log(`Loaded: ${resolveFile(file)}`);
      console.log(`  Environment variables: ${config.envVars.length}`);
      console.log(`  PATH entries: ${config.pathEntries.length}`);
      console.log(`  Other lines: ${config.rawLines.length}`);
    });

  // --- env commands ---
  const envCmd = program
    .command("env")
    .description("Manage environment variables");

  envCmd
    .command("list")
    .description("List all environment variables")
    .argument("<file>", "Shell config file")
    .action((file: string) => {
      const config = loadConfig(file);
      const vars = listEnvVars(config);
      if (vars.length === 0) {
        console.log("No environment variables found.");
        return;
      }
      for (const v of vars) {
        console.log(`${v.name}=${v.value}`);
      }
    });

  envCmd
    .command("get")
    .description("Get the value of an environment variable")
    .argument("<file>", "Shell config file")
    .argument("<name>", "Variable name")
    .action((file: string, name: string) => {
      const config = loadConfig(file);
      const v = getEnvVar(config, name);
      if (!v) {
        console.error(`Variable "${name}" not found.`);
        process.exit(1);
      }
      console.log(v.value);
    });

  envCmd
    .command("set")
    .description("Set an environment variable and save")
    .argument("<file>", "Shell config file")
    .argument("<name>", "Variable name")
    .argument("<value>", "Variable value")
    .option("-f, --format <format>", "Output format (zsh, bash)")
    .action(
      (
        file: string,
        name: string,
        value: string,
        opts: { format?: string },
      ) => {
        let config = loadConfig(file);
        config = setEnvVar(config, name, value);
        saveConfig(config, file, opts.format);
      },
    );

  envCmd
    .command("rm")
    .description("Remove an environment variable and save")
    .argument("<file>", "Shell config file")
    .argument("<name>", "Variable name")
    .option("-f, --format <format>", "Output format (zsh, bash)")
    .action((file: string, name: string, opts: { format?: string }) => {
      let config = loadConfig(file);
      config = removeEnvVar(config, name);
      saveConfig(config, file, opts.format);
    });

  // --- path commands ---
  const pathCmd = program
    .command("path")
    .description("Manage PATH entries");

  pathCmd
    .command("list")
    .description("List all PATH entries")
    .argument("<file>", "Shell config file")
    .action((file: string) => {
      const config = loadConfig(file);
      const entries = listPathEntries(config);
      if (entries.length === 0) {
        console.log("No PATH entries found.");
        return;
      }
      for (const e of entries) {
        console.log(`[${e.position}] ${e.path}`);
      }
    });

  pathCmd
    .command("add")
    .description("Add a PATH entry and save")
    .argument("<file>", "Shell config file")
    .argument("<path>", "Directory path to add")
    .option(
      "-p, --position <position>",
      "Position: prepend or append",
      "prepend",
    )
    .option("-f, --format <format>", "Output format (zsh, bash)")
    .action(
      (
        file: string,
        dirPath: string,
        opts: { position: string; format?: string },
      ) => {
        const position = opts.position as "prepend" | "append";
        if (position !== "prepend" && position !== "append") {
          console.error('Position must be "prepend" or "append".');
          process.exit(1);
        }
        let config = loadConfig(file);
        config = addPathEntry(config, dirPath, position);
        saveConfig(config, file, opts.format);
      },
    );

  pathCmd
    .command("rm")
    .description("Remove a PATH entry and save")
    .argument("<file>", "Shell config file")
    .argument("<path>", "Directory path to remove")
    .option("-f, --format <format>", "Output format (zsh, bash)")
    .action(
      (file: string, dirPath: string, opts: { format?: string }) => {
        let config = loadConfig(file);
        config = removePathEntry(config, dirPath);
        saveConfig(config, file, opts.format);
      },
    );

  // --- lint command ---
  program
    .command("lint")
    .description("Lint a shell config file for issues")
    .argument("<file>", "Shell config file to lint")
    .action((file: string) => {
      const config = loadConfig(file);
      const messages = linter.lint(config);

      if (messages.length === 0) {
        console.log("No issues found.");
        return;
      }

      for (const msg of messages) {
        const loc = msg.line ? `:${msg.line}` : "";
        const src = msg.source ? `${msg.source}` : resolveFile(file);
        console.log(`[${msg.severity}] ${src}${loc} (${msg.rule}): ${msg.message}`);
      }

      const errors = messages.filter((m) => m.severity === "error").length;
      const warnings = messages.filter((m) => m.severity === "warning").length;
      const infos = messages.filter((m) => m.severity === "info").length;
      console.log(
        `\nFound ${errors} error(s), ${warnings} warning(s), ${infos} info(s).`,
      );

      if (errors > 0) {
        process.exit(1);
      }
    });

  // --- export command ---
  program
    .command("export")
    .description("Export config to stdout in the specified format")
    .argument("<file>", "Shell config file")
    .option("-f, --format <format>", "Output format (zsh, bash)", "zsh")
    .action((file: string, opts: { format: string }) => {
      const config = loadConfig(file);
      const formatter = registry.get(opts.format);
      const output = formatter.format(config);
      process.stdout.write(output);
    });

  // --- formats command ---
  program
    .command("formats")
    .description("List available output formats")
    .action(() => {
      const formats = registry.listFormats();
      const defaultFmt = registry.getDefaultFormat();
      for (const f of formats) {
        const marker = f === defaultFmt ? " (default)" : "";
        console.log(`  ${f}${marker}`);
      }
    });

  return program;
}
