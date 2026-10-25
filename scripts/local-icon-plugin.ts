import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
const shippedDirectory = path.resolve("assets/app-icons");
const shipped = existsSync(path.join(shippedDirectory, "manifest.json"));
const directory = shipped
  ? shippedDirectory
  : path.resolve("work/original-icons");
const manifestFile = path.join(
  directory,
  shipped ? "manifest.json" : "sources.json",
);
export function localIconPlugin(command: string): Plugin {
  const enabled =
    shipped ||
    process.env.FOUNDPHONE_ORIGINAL_ICONS === "1" ||
    (command === "serve" && existsSync(manifestFile));
  const manifest = enabled
    ? (JSON.parse(readFileSync(manifestFile, "utf8")).results as Record<
        string,
        { file: string }
      >)
    : {};
  const files = new Set(Object.values(manifest).map((x) => x.file));
  return {
    name: "foundphone-local-icons",
    config() {
      return {
        define: {
          "import.meta.env.VITE_ORIGINAL_ICONS": JSON.stringify(
            enabled ? "true" : "false",
          ),
        },
      };
    },
    configureServer(server) {
      if (!enabled) return;
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || "/", "http://localhost");
        if (!url.pathname.startsWith("/icon-assets/")) return next();
        const name = url.pathname.slice("/icon-assets/".length);
        if (!files.has(name) || path.basename(name) !== name) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader(
          "Content-Type",
          name.endsWith(".svg")
            ? "image/svg+xml"
            : name.endsWith(".png")
              ? "image/png"
              : "image/jpeg",
        );
        res.setHeader("Cache-Control", "no-cache");
        res.end(readFileSync(path.join(directory, name)));
      });
    },
    generateBundle() {
      if (!enabled) return;
      for (const file of files) {
        if (path.basename(file) !== file) throw Error("Unsafe local icon path");
        this.emitFile({
          type: "asset",
          fileName: "icon-assets/" + file,
          source: readFileSync(path.join(directory, file)),
        });
      }
    },
  };
}
