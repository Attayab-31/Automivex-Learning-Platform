import { verifyGithubRepository } from "../src/github.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const originalFetch = globalThis.fetch;
const commitSha = "748f3ba2f6496f69d5f961881b4e2995ae34424f";
const treeSha = "a4374f853146122fa2264778b330bc38c577556c";
const files = [
  ".github/workflows/tests.yml",
  "README.md",
  "alembic/env.py",
  "app/main.py",
  "docker-compose.yml",
  "pyproject.toml",
  "tests/test_api.py"
].map(path => ({ path, type: "blob" }));
const requests = [];

globalThis.fetch = async input => {
  const url = new URL(input);
  requests.push(url);
  if (url.pathname === "/repos/example/support-api") {
    return Response.json({ id: 123, default_branch: "main", private: false, archived: false, html_url: "https://github.com/example/support-api" });
  }
  if (url.pathname === "/repos/example/support-api/commits") {
    return Response.json([{ sha: commitSha, commit: { tree: { sha: treeSha } } }]);
  }
  if (url.pathname === `/repos/example/support-api/git/trees/${treeSha}`) {
    return Response.json({ sha: treeSha, truncated: false, tree: files });
  }
  throw new Error(`Unexpected GitHub API request: ${url}`);
};

try {
  const result = await verifyGithubRepository("https://github.com/example/support-api");
  assert(result.passed && result.score === 7, "Valid repository snapshot did not pass the checklist");
  assert(result.commitSha === commitSha, "Latest commit SHA was not preserved");
  assert(result.treeSha === treeSha, "Root tree SHA was not taken from the latest commit");
  assert(requests.length === 3 && requests[2].pathname.endsWith(`/git/trees/${treeSha}`), "Tree lookup was not pinned to the latest commit's tree SHA");

  globalThis.fetch = async input => {
    const url = new URL(input);
    if (url.pathname === "/repos/example/support-api") {
      return Response.json({ id: 123, default_branch: "main", private: false, archived: false });
    }
    if (url.pathname === "/repos/example/support-api/commits") {
      return Response.json([{ sha: commitSha, commit: { tree: { sha: treeSha } } }]);
    }
    return Response.json({ sha: commitSha, truncated: false, tree: files });
  };
  await verifyGithubRepository("https://github.com/example/support-api")
    .then(() => { throw new Error("A tree response for the commit SHA should be rejected"); })
    .catch(error => assert(error.message.includes("incomplete repository file tree"), "Unexpected error for mismatched tree SHA"));
} finally {
  globalThis.fetch = originalFetch;
}

console.log("GitHub repository snapshot tests passed");
