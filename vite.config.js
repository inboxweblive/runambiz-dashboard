import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const root = import.meta.dirname;

const pages = ["index", "admin", "claim", "store"];

export default defineConfig({
  plugins: [react()],
  base: "/dashboard/",
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page, resolve(root, `${page}.html`)])
      ),
    },
  },
});
