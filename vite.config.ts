import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";
import { aliases } from "./vite.aliases";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [
		solid(),
		solidSvg({ defaultAsComponent: true }),
		tailwindcss(),
		visualizer({ open: false }),
	],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	resolve: {
		alias: aliases,
	},
	optimizeDeps: {
		include: ["@codemirror/state", "@codemirror/view"],
	},

	server: {
		port: 1420,
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
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
}));
