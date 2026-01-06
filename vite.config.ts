import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import { aliases } from "./vite.aliases";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	base: "./",
	plugins: [
		solid(),
		solidSvg({ defaultAsComponent: true }),
		tailwindcss(),
		visualizer({ open: false }),
	],
	resolve: {
		alias: aliases,
	},
	optimizeDeps: {
		include: ["@codemirror/state", "@codemirror/view"],
	},
	clearScreen: false,
	server: {
		port: 1420, // dev port
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			ignored: ["**/src-tauri/**"],
		},
	},
	build: {
		target:
			process.env.TAURI_ENV_PLATFORM === "windows"
				? "chrome105"
				: "safari13",
		minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
		sourcemap: !!process.env.TAURI_ENV_DEBUG,
	},
});
