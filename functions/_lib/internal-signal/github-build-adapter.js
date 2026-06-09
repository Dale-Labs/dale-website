import {
  SIGNAL_SOURCE,
  notConfiguredResult,
} from "./contracts.js";

export function createGitHubBuildAdapter() {
  return {
    source: SIGNAL_SOURCE.BUILD,

    async read() {
      return notConfiguredResult(
        SIGNAL_SOURCE.BUILD,
        "GitHub build adapter is a placeholder; no API or repository ingestion is configured.",
      );
    },
  };
}

