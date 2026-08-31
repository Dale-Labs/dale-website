import {
  SIGNAL_SOURCE,
  notConfiguredResult,
} from "./contracts.js";

export function createGoogleDriveKnowledgeAdapter() {
  return {
    source: SIGNAL_SOURCE.KNOWLEDGE,

    async read() {
      return notConfiguredResult(
        SIGNAL_SOURCE.KNOWLEDGE,
        "Google Drive knowledge adapter is a placeholder; no Workspace API is configured.",
      );
    },
  };
}
