import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import netlify from "@netlify/vite-plugin";
import path from "path";

const repoRoot = path.resolve(import.meta.dirname);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const stripePublishable = (
    env.VITE_STRIPE_PUBLISHABLE_KEY ||
    env.STRIPE_PUBLISHABLE_KEY ||
    ""
  ).trim();

  return {
    envDir: repoRoot,
    ...(stripePublishable
      ? {
          define: {
            "import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY": JSON.stringify(stripePublishable),
          },
        }
      : {}),
    // netlify() emula /.netlify/functions/* en local (dev) y adapta el build para Netlify.
    // La advertencia "Multiple instances" en hot-reload es inofensiva: el plugin
    // también se auto-inyecta al detectar netlify.toml, pero ambas instancias son idénticas.
    plugins: [react(), netlify()],
    resolve: {
      alias: {
        "@": path.resolve(repoRoot, "client", "src"),
        "@assets": path.resolve(repoRoot, "attached_assets"),
      },
    },
    root: path.resolve(repoRoot, "client"),
    build: {
      outDir: path.resolve(repoRoot, "dist"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: false,
        allow: [".."],
      },
    },
  };
});
