import {
  ADAPTER_STATUS,
  assembleSignalObjects,
  createD1RegistryAdapter,
  createGitHubBuildAdapter,
  createGoogleDriveKnowledgeAdapter,
} from "./index.js";

function adapterSummary(result) {
  return {
    source: result.source,
    status: result.status,
    observedAt: result.observedAt,
    recordCount: result.records.length,
    warnings: result.warnings,
  };
}

export function registryDatabase(env) {
  return env.DALE_ARTIFACT_DB || env.DALE_REGISTRY_DB || null;
}

export async function readInternalSignal(env) {
  const [registry, build, knowledge] = await Promise.all([
    createD1RegistryAdapter({ db: registryDatabase(env) }).read(),
    createGitHubBuildAdapter().read(),
    createGoogleDriveKnowledgeAdapter().read(),
  ]);

  const signalObjects = registry.status === ADAPTER_STATUS.READY
    ? assembleSignalObjects({
      registry: registry.records,
      buildActivity: build.records,
      knowledge: knowledge.records,
    })
    : [];

  return {
    ready: registry.status === ADAPTER_STATUS.READY,
    generatedAt: new Date().toISOString(),
    signalObjects,
    adapters: {
      registry: adapterSummary(registry),
      build: adapterSummary(build),
      knowledge: adapterSummary(knowledge),
    },
  };
}

