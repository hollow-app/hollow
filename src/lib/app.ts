import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";
import { check, Update } from "@tauri-apps/plugin-updater";
import { hollow } from "../hollow";
import { useColor } from "@hooks/useColor";
import useTags from "@hooks/useTags";
import { IStore, StoreType } from "@type/hollow";
import { Storage } from "@managers/Storage";
import useGrid from "@hooks/useGrid";
import {
	getCurrentWindow,
	type CloseRequestedEvent,
} from "@tauri-apps/api/window";
import { relaunch } from "@tauri-apps/plugin-process";
import { first_launch, get_platform, start_realm } from "./rust";

type ShutdownHandler = () => Promise<void> | void;

let downloading = false;
const handlers = new Set<ShutdownHandler>();
let closing = false;
let unlisten: (() => void) | undefined;

window.addEventListener("offline", () => {
	hollow.events.emit("network-state", false);
});
window.addEventListener("online", () => {
	hollow.events.emit("network-state", true);
});

// logging
const logMap = {
	log: trace,
	debug,
	info,
	warn,
	error,
} as const;
type ConsoleMethod = keyof typeof logMap;
const safeStringify = (obj: unknown) => {
	const seen = new WeakSet();
	return JSON.stringify(
		obj,
		(key, value) => {
			if (typeof value === "object" && value !== null) {
				if (seen.has(value)) return "[Circular]";
				seen.add(value);
			}
			return value;
		},
		2,
	);
};

for (const method of Object.keys(logMap) as ConsoleMethod[]) {
	const original = console[method].bind(console);
	const forward = logMap[method];
	console[method] = (...args: unknown[]) => {
		original(...args);
		const message = args
			.map((a) => (typeof a === "object" ? safeStringify(a) : String(a)))
			.join(" ");
		void forward(message);
	};
}

export async function preRealmSelection() {
	if (!localStorage.first_launch) {
		localStorage.first_launch = "true";
		first_launch();
	}
	await hollow.pevents.emitAsync("pre-realm");
	return true;
}

export async function postRealmSelection(location: string) {
	if (!localStorage.platform) {
		localStorage.platform = await get_platform();
	}
	await start_realm({
		location,
	});
	await hollow.pevents.emitAsync("post-realm");
	useColor({ name: "secondary" });
	useColor({ name: "primary" });
	useGrid();
	useTags();
	handleEvents();
	await checkUpdate();
}

function handleEvents() {
	// returns Promise

	const requestStore = (props: StoreType): Promise<IStore> => {
		return Storage.create(props);
	};
	// returns a function that returns Promise<IStore>
	hollow.events.emit("store", requestStore);
}

export async function checkUpdate(manual?: boolean, debounce?: () => void) {
	const noUpdates = () => {
		if (manual) {
			hollow.events.emit("alert", {
				type: "info",
				title: "Up to Date",
				message:
					"You are running the latest version. No updates are available at this time.",
				duration: 25000,
			});
		}
	};

	if (downloading) {
		if (manual) {
			hollow.events.emit("alert", {
				type: "info",
				title: "Update Downloading",
				message:
					"An update is already being downloaded. Please wait until it finishes.",
				duration: 15000,
			});
		}
		debounce?.();
		return;
	}

	try {
		const update = await check();
		if (update) {
			console.log(
				`found update ${update.version} from ${update.date} with notes ${update.body}`,
			);
			if (JSON.parse(localStorage.autoUpdate ?? "true")) {
				await performUpdate(update);
			} else if (manual) {
				hollow.events.emit("alert", {
					type: "success",
					title: "Update Available",
					message:
						"A new version is ready to download with improvements and fixes.",
					duration: 25000,
					button: {
						label: "Download Now",
						callback: async () => {
							await performUpdate(update);
						},
					},
				});
			}
		} else {
			noUpdates();
		}
	} catch (e) {
		noUpdates();
	} finally {
		debounce?.();
	}
}

async function performUpdate(update: Update) {
	if (downloading) return;
	downloading = true;

	let downloaded = 0;
	let contentLength = 0;

	try {
		await update.downloadAndInstall((event) => {
			switch (event.event) {
				case "Started":
					contentLength = event.data.contentLength;
					console.log(`started downloading ${contentLength} bytes`);
					break;

				case "Progress":
					downloaded += event.data.chunkLength;
					console.log(`downloaded ${downloaded} / ${contentLength}`);
					break;

				case "Finished":
					console.log("download finished");
					hollow.events.emit("alert", {
						type: "success",
						title: "Update Ready",
						message:
							"The latest update has been downloaded successfully and is ready to install.",
						button: {
							label: "Relaunch Now",
							callback: async () => {
								await relaunch();
							},
						},
					});
					break;
			}
		});
	} finally {
		downloading = false;
	}
}

export function register(handler: ShutdownHandler): () => void {
	handlers.add(handler);
	return () => handlers.delete(handler);
}

async function handleClose(event: CloseRequestedEvent) {
	if (closing) return;
	closing = true;
	event.preventDefault();
	try {
		await Promise.all(
			Array.from(handlers).map((fn) => Promise.resolve().then(fn)),
		);
	} catch (err) {
		console.error("Shutdown handler failed:", err);
	}
	unlisten?.();
	await getCurrentWindow().close();
}
