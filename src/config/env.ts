import type { ShellConfig, EnvVar } from "./types.js";

/** List all environment variables in the config */
export function listEnvVars(config: ShellConfig): EnvVar[] {
  return config.envVars;
}

/** Get an environment variable by name. Returns the last definition if duplicates exist. */
export function getEnvVar(config: ShellConfig, name: string): EnvVar | undefined {
  const matches = config.envVars.filter((v) => v.name === name);
  return matches.length > 0 ? matches[matches.length - 1] : undefined;
}

/** Set (add or update) an environment variable. If it already exists, updates the last occurrence. */
export function setEnvVar(
  config: ShellConfig,
  name: string,
  value: string,
  source: string = "<cli>",
): ShellConfig {
  const existingIndex = findLastIndex(config.envVars, (v) => v.name === name);

  const newEnvVars = [...config.envVars];

  if (existingIndex >= 0) {
    // Update existing
    newEnvVars[existingIndex] = {
      ...newEnvVars[existingIndex],
      value,
    };
  } else {
    // Add new
    newEnvVars.push({
      name,
      value,
      line: -1, // Indicates newly added
      source,
    });
  }

  return { ...config, envVars: newEnvVars };
}

/** Remove an environment variable by name. Removes all occurrences. */
export function removeEnvVar(config: ShellConfig, name: string): ShellConfig {
  return {
    ...config,
    envVars: config.envVars.filter((v) => v.name !== name),
  };
}

function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
}
