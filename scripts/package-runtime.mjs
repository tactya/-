import { copyFile } from "node:fs/promises";
for (const name of ["LICENSE", "THIRD_PARTY_LICENSES.txt", "BRAND_NOTICE.txt"])
  await copyFile(name, "dist/" + name);
console.log("Runtime license notices included.");

await copyFile("src/vendor/mymy/NOTICE.txt", "dist/MYMY_NOTICE.txt");
