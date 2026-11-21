import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    {
      name: "markdown-raw",
      resolveId(id, importer) {
        if (id.includes(".md") && id.includes("?raw")) {
          // Return the id as-is so Vite can resolve it
          return id;
        }
        return null;
      },
      load(id) {
        if (id.includes(".md") && id.includes("?raw")) {
          // Remove ?raw and resolve the actual file path
          const filePath = id.split("?")[0];
          let resolvedPath: string;
          
          // If it's a relative path starting with ../, resolve from app directory
          if (filePath.startsWith("../")) {
            resolvedPath = resolve(__dirname, "app", filePath.replace("../", ""));
          } else if (filePath.startsWith("./")) {
            resolvedPath = resolve(__dirname, filePath.replace("./", ""));
          } else {
            // Absolute path or node_modules, try as-is first
            resolvedPath = filePath;
          }
          
          try {
            const content = readFileSync(resolvedPath, "utf-8");
            return `export default ${JSON.stringify(content)}`;
          } catch (error) {
            // Try alternative resolution
            try {
              const altPath = resolve(process.cwd(), "app", filePath.replace("../", ""));
              const content = readFileSync(altPath, "utf-8");
              return `export default ${JSON.stringify(content)}`;
            } catch (altError) {
              console.error(`Failed to load markdown file: ${resolvedPath}`, error);
              return `export default ""`;
            }
          }
        }
        return null;
      },
    },
  ],
  assetsInclude: ["**/*.md"],
});
