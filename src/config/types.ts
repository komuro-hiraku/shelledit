/** Represents a single environment variable definition */
export interface EnvVar {
  name: string;
  value: string;
  /** Original line number in the source file */
  line: number;
  /** Source file path */
  source: string;
}

/** Represents a single PATH entry */
export interface PathEntry {
  /** The directory path */
  path: string;
  /** Whether this is prepended or appended to PATH */
  position: "prepend" | "append";
  /** Original line number in the source file */
  line: number;
  /** Source file path */
  source: string;
}

/** Represents a line that is not parsed into structured data */
export interface RawLine {
  content: string;
  line: number;
  source: string;
}

/** The internal representation of a shell configuration */
export interface ShellConfig {
  envVars: EnvVar[];
  pathEntries: PathEntry[];
  rawLines: RawLine[];
}

/** Creates an empty ShellConfig */
export function createEmptyConfig(): ShellConfig {
  return {
    envVars: [],
    pathEntries: [],
    rawLines: [],
  };
}
