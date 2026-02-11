import type { ShellConfig, PathEntry } from "./types.js";

/** List all PATH entries in the config */
export function listPathEntries(config: ShellConfig): PathEntry[] {
  return config.pathEntries;
}

/** Add a new PATH entry */
export function addPathEntry(
  config: ShellConfig,
  path: string,
  position: "prepend" | "append" = "prepend",
  source: string = "<cli>",
): ShellConfig {
  const newEntry: PathEntry = {
    path,
    position,
    line: -1,
    source,
  };

  return {
    ...config,
    pathEntries: [...config.pathEntries, newEntry],
  };
}

/** Remove a PATH entry by its path value. Removes all matching entries. */
export function removePathEntry(config: ShellConfig, path: string): ShellConfig {
  return {
    ...config,
    pathEntries: config.pathEntries.filter((e) => e.path !== path),
  };
}

/** Update the position of an existing PATH entry */
export function updatePathEntry(
  config: ShellConfig,
  path: string,
  position: "prepend" | "append",
): ShellConfig {
  return {
    ...config,
    pathEntries: config.pathEntries.map((e) =>
      e.path === path ? { ...e, position } : e,
    ),
  };
}
