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
    unmatchedCount: result.unmatchedRecords?.length || 0,
    observations: result.unmatchedRecords || [],
    warnings: result.warnings,
  };
}

export function registryDatabase(env) {
  return env.DALE_ARTIFACT_DB || env.DALE_REGISTRY_DB || null;
}

export async function readInternalSignal(env) {
  const registry = await createD1RegistryAdapter({
    db: registryDatabase(env),
  }).read();
  const [build, knowledge] = await Promise.all([
    createGitHubBuildAdapter({
      token: env.DALE_GITHUB_TOKEN,
      owner: env.DALE_GITHUB_OWNER,
      repo: env.DALE_GITHUB_REPO,
      branch: env.DALE_GITHUB_BRANCH,
      registry: registry.records,
      fetchImpl: env.DALE_GITHUB_FETCH || globalThis.fetch,
    }).read(),
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
