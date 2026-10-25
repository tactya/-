import { spawnSync } from "node:child_process";
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell: false });
  if (r.error) {
    console.log(`${cmd} unavailable: ${r.error.message}`);
    return false;
  }
  console.log((r.stdout || r.stderr).trim());
  return r.status === 0;
};
if (!run("git", ["--version"])) process.exit(1);
run("git", ["remote", "-v"]);
if (!run("gh", ["--version"])) {
  console.log(
    "Install GitHub CLI to inspect Fork metadata. No account writes were performed.",
  );
  process.exit(0);
}
if (!run("gh", ["auth", "status"])) process.exit(0);
run("gh", ["repo", "view", "--json", "nameWithOwner,isFork,parent,url"]);
console.log(
  "Recommended: Fork upstream and clone your Fork before customization. This helper is read-only. After explicit authorization, you may run gh repo fork manually. No Star, Fork or Push was performed.",
);
