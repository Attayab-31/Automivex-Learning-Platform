export async function verifyGithubRepository(input) {
  let parsed;
  try { parsed = new URL(input); } catch { throw new Error("Enter a valid GitHub repository URL."); }
  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com" || parsed.port || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Only a direct public github.com repository link is accepted.");
  }
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) throw new Error("Use a repository URL such as https://github.com/username/project.");
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  if (!/^[a-zA-Z0-9-]{1,39}$/.test(owner) || !/^[a-zA-Z0-9_.-]{1,100}$/.test(repo) || repo === "." || repo === "..") {
    throw new Error("The GitHub owner or repository name is invalid.");
  }
  const headers = { "Accept": "application/vnd.github+json", "User-Agent": "Automivex-Learning-Project-Checker", "X-GitHub-Api-Version": "2022-11-28" };
  const repoRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { headers });
  if (repoRes.status === 404) throw new Error("Repository not found. Make it public and check the URL.");
  if (repoRes.status === 403) throw new Error("GitHub's unauthenticated API limit was reached. Try again later.");
  if (!repoRes.ok) throw new Error("GitHub could not verify this repository right now.");
  const meta = await repoRes.json();
  if (meta.private || meta.archived) throw new Error("The repository must be public and not archived for automated verification.");
  const commitRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(meta.default_branch)}&per_page=1`, { headers });
  if (!commitRes.ok) throw new Error("Could not verify the latest repository commit. Try again later.");
  const commitData = await commitRes.json();
  const commitSha = Array.isArray(commitData) && commitData[0]?.sha ? commitData[0].sha : null;
  if (!commitSha) throw new Error("GitHub did not return a verifiable repository commit. Try again later.");
  const treeSha = commitData[0]?.commit?.tree?.sha;
  if (typeof treeSha !== "string" || !treeSha) throw new Error("GitHub did not return the repository tree for its latest commit.");
  const treeRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(treeSha)}?recursive=1`, { headers });
  if (!treeRes.ok) throw new Error("Could not inspect repository files. Try again later.");
  const tree = await treeRes.json();
  if (tree.truncated || !Array.isArray(tree.tree) || tree.sha !== treeSha) throw new Error("GitHub returned an incomplete repository file tree. Try again later.");
  const paths = new Set((tree.tree || []).filter(x=>x.type === "blob").map(x=>x.path.toLowerCase()));
  const dirs = new Set((tree.tree || []).filter(x=>x.type === "tree").map(x=>x.path.toLowerCase()));
  const checks = [
    { id: "readme", label: "README with setup and API instructions", passed: paths.has("readme.md") || paths.has("readme.rst") },
    { id: "entry", label: "FastAPI application entry point", passed: ["app/main.py","src/main.py","main.py","app/api.py"].some(p=>paths.has(p)) },
    { id: "dependencies", label: "Dependency manifest", passed: paths.has("pyproject.toml") || paths.has("requirements.txt") || paths.has("poetry.lock") },
    { id: "tests", label: "Automated tests", passed: [...paths].some(p=>p.startsWith("tests/") && p.endsWith(".py")) },
    { id: "ci", label: "GitHub Actions CI workflow", passed: [...paths].some(p=>p.startsWith(".github/workflows/") && (p.endsWith(".yml") || p.endsWith(".yaml"))) },
    { id: "migrations", label: "Database migrations", passed: [...dirs].some(p=>p === "alembic" || p === "migrations") || [...paths].some(p=>p.startsWith("alembic/") || p.startsWith("migrations/")) },
    { id: "docker", label: "Docker Compose configuration", passed: paths.has("docker-compose.yml") || paths.has("docker-compose.yaml") || paths.has("compose.yml") || paths.has("compose.yaml") }
  ];
  const passed = checks.filter(c=>c.passed).length;
  const coreReady = checks.slice(0,5).every(c=>c.passed);
  return {
    owner,
    repo,
    repositoryId: String(meta.id || ""),
    commitSha,
    treeSha,
    url: meta.html_url,
    defaultBranch: meta.default_branch,
    checkedAt: new Date().toISOString(),
    checks,
    score: passed,
    total: checks.length,
    passed: coreReady && passed >= 6,
    message: coreReady && passed >= 6 ? "Repository structure meets the automated submission checklist at the verified commit." : "Add the missing core project files and submit again. A file checklist does not replace a human code review."
  };
}
