export const SIGNAL_SOURCE = Object.freeze({
  REGISTRY: "d1_registry",
  BUILD: "github_build",
  KNOWLEDGE: "google_drive_knowledge",
  STATIC: "static_seed",
});

export const ADAPTER_STATUS = Object.freeze({
  READY: "ready",
  NOT_CONFIGURED: "not_configured",
  UNAVAILABLE: "unavailable",
});

export function adapterResult(source, {
  status = ADAPTER_STATUS.READY,
  records = [],
  observedAt = new Date().toISOString(),
  warnings = [],
} = {}) {
  return {
    source,
    status,
    observedAt,
    records,
    warnings,
  };
}

export function notConfiguredResult(source, message) {
  return adapterResult(source, {
    status: ADAPTER_STATUS.NOT_CONFIGURED,
    warnings: [message],
  });
}
