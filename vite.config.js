import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basename from "./basename";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `/${basename}/`,
});
