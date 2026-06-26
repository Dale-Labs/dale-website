import {
  ADAPTER_STATUS,
  SIGNAL_SOURCE,
  adapterResult,
  notConfiguredResult,
} from "./contracts.js";

const DEFAULT_COMMIT_LIMIT = 20;

function normalizePath(value) {
  if (!value) return "";
  let decoded = String(value);
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the original value when it is not valid URI encoding.
  }
  return decoded.replaceAll("\\", "/").replace(/^\/+/, "").replace(/\/+$/, "");
}

function artifactPaths(artifact) {
  const paths = new Set();
  const repositoryPath = normalizePath(artifact.metadata?.repository_path);
  const sourcePath = String(artifact.sourceUrl || "").startsWith("repo://")
    ? normalizePath(String(artifact.sourceUrl).slice("repo://".length))
    : "";
  const internalRoute = normalizePath(artifact.internalRoute);

  if (repositoryPath) paths.add(repositoryPath);
  if (sourcePath) paths.add(sourcePath);
  if (internalRoute) {
    paths.add(internalRoute);
    if (String(artifact.internalRoute).endsWith("/")) {
      paths.add(`${internalRoute}/index.html`);
    }
  }

  return [...paths];
}

function commitObservation(commit, details, owner, repo, branch) {
  const message = String(commit.commit?.message || "");
  return {
    activityId: commit.sha,
    occurredAt: commit.commit?.author?.date || commit.commit?.committer?.date || null,
    summary: message.split("\n")[0],
    message,
    author: commit.commit?.author?.name || commit.author?.login || "",
    url: commit.html_url || `https://github.com/${owner}/${repo}/commit/${commit.sha}`,
    repository: `${owner}/${repo}`,
    branch,
    files: (details.files || []).map(file => normalizePath(file.filename)).filter(Boolean),
  };
}

function matchingArtifacts(observation, registry) {
  const explicit = registry.filter(artifact =>
    artifact.artifactId && observation.message.includes(artifact.artifactId)
  );
  if (explicit.length) {
    return explicit.map(artifact => ({ artifact, matchReason: "artifact_id" }));
  }

  return registry
    .filter(artifact => {
      const paths = artifactPaths(artifact);
      return observation.files.some(file =>
        paths.some(path => file === path || file.startsWith(`${path}/`))
      );
    })
    .map(artifact => ({ artifact, matchReason: "repository_path" }));
}

async function githubJson(fetchImpl, url, token) {
  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "DALE-Internal-Signal",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}.`);
  }
  return response.json();
}

function unmatchedWarnings(records) {
  const warnings = records.slice(0, 10).map(record =>
    `Unregistered GitHub activity ${record.activityId.slice(0, 7)}: ${record.summary}`
  );
  if (records.length > warnings.length) {
    warnings.push(`${records.length - warnings.length} additional unmatched commits omitted.`);
  }
  return warnings;
}

export function createGitHubBuildAdapter({
  token,
  owner,
  repo,
  branch,
  registry = [],
  fetchImpl = globalThis.fetch,
  commitLimit = DEFAULT_COMMIT_LIMIT,
} = {}) {
  return {
    source: SIGNAL_SOURCE.BUILD,

    async read() {
      if (!token || !owner || !repo || !branch || typeof fetchImpl !== "function") {
        return {
          ...notConfiguredResult(
            SIGNAL_SOURCE.BUILD,
            "GitHub build adapter requires DALE_GITHUB_TOKEN, DALE_GITHUB_OWNER, DALE_GITHUB_REPO, and DALE_GITHUB_BRANCH.",
          ),
          unmatchedRecords: [],
        };
      }

      try {
        const apiRoot = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
        const query = new URLSearchParams({
          sha: branch,
          per_page: String(commitLimit),
        });
        const commits = await githubJson(
          fetchImpl,
          `${apiRoot}/commits?${query}`,
          token,
        );
        const details = await Promise.all(
          commits.map(commit =>
            githubJson(fetchImpl, `${apiRoot}/commits/${commit.sha}`, token)
          ),
        );

        const records = [];
        const unmatchedRecords = [];

        commits.forEach((commit, index) => {
          const observation = commitObservation(
            commit,
            details[index] || {},
            owner,
            repo,
            branch,
          );
          const matches = matchingArtifacts(observation, registry);

          if (!matches.length) {
            unmatchedRecords.push(observation);
            return;
          }

          for (const { artifact, matchReason } of matches) {
            records.push({
              ...observation,
              artifactId: artifact.artifactId,
              matchReason,
            });
          }
        });

        return {
          ...adapterResult(SIGNAL_SOURCE.BUILD, {
            records,
            warnings: unmatchedWarnings(unmatchedRecords),
          }),
          unmatchedRecords,
        };
      } catch (error) {
        return {
          ...adapterResult(SIGNAL_SOURCE.BUILD, {
            status: ADAPTER_STATUS.UNAVAILABLE,
            warnings: [error.message],
          }),
          unmatchedRecords: [],
        };
      }
    },
  };
}
