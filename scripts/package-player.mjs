import { mkdir, cp, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const dest = "dist/player-runtime";
await mkdir(dest, { recursive: true });
const list = await readdir("dist-player", {
  recursive: true,
  withFileTypes: true,
});
const files = [];
for (const entry of list) {
  if (!entry.isFile()) continue;
  const rel = path
    .relative("dist-player", path.join(entry.parentPath, entry.name))
    .replaceAll("\\", "/");
  await cp(path.join("dist-player", rel), path.join(dest, rel), {
    recursive: true,
  });
  files.push(rel);
}
for (const name of [
  "LICENSE",
  "THIRD_PARTY_LICENSES.txt",
  "BRAND_NOTICE.txt",
]) {
  await cp(name, path.join(dest, name));
  files.push(name);
}
await cp("src/vendor/mymy/NOTICE.txt", path.join(dest, "MYMY_NOTICE.txt"));
files.push("MYMY_NOTICE.txt");
await writeFile(path.join(dest, "manifest.json"), JSON.stringify(files));
console.log(`Prepared standalone player: ${files.length} files.`);
