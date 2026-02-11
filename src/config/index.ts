export type { ShellConfig, EnvVar, PathEntry, RawLine } from "./types.js";
export { createEmptyConfig } from "./types.js";
export { listEnvVars, getEnvVar, setEnvVar, removeEnvVar } from "./env.js";
export { listPathEntries, addPathEntry, removePathEntry, updatePathEntry } from "./path.js";
