import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";
import { check, Update } from "@tauri-apps/plugin-updater";
import { hollow } from "hollow";
import { ToolManager } from "./ToolManager";
import { useColor } from "@hooks/useColor";
import useTags from "@hooks/useTags";
import { DataBaseRequest, IStore, StoreType } from "@type/hollow";
import { ToolDataBase } from "./ToolDataBase";
import { Storage } from "./Storage";
import useGrid from "@hooks/useGrid";
import { manager, Managers } from ".";
import {
	getCurrentWindow,
	type CloseRequestedEvent,
} from "@tauri-apps/api/window";
import { relaunch } from "@tauri-apps/plugin-process";

type ShutdownHandler = () => Promise<void> | void;
export class HollowManager {
	private readonly managers: Managers;
	private downloading = false;

	private handlers = new Set<ShutdownHandler>();
	private closing = false;
	private unlisten?: () => void;

	constructor(managers: Managers) {
		this.managers = managers;
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
					.map((a) =>
						typeof a === "object" ? safeStringify(a) : String(a),
					)
					.join(" ");
				void forward(message);
			};
		}
		//
	}

	async preRealmSelection() {
		if (!localStorage.realmToggleOnStartup) {
			localStorage.realmToggleOnStartup = "false";
			await this.managers?.rust.first_launch();
		}
		await this.managers?.realm.start();
		await this.managers?.deeplink.start();
		// not needed
		// const window = getCurrentWindow();
		// this.unlisten = await window.onCloseRequested((event) =>
		// 	this.handleClose(event),
		// );

		return true;
	}

	async postRealmSelection() {
		if (!localStorage.platform) {
			localStorage.platform = await this.managers?.rust.get_platform();
		}
		await this.managers?.vault.start();
		await this.managers?.rust.start_realm({
			location: this.managers?.realm.getCurrent().location,
		});
		//
		await this.managers?.settings.start();
		hollow.toolManager = new ToolManager(manager);
		hollow.toolManager.start(
			this.managers?.settings.getConfig("load-unsigned-plugins"),
		);
		await this.managers?.codeTheme.init();
		await this.managers?.markdown.start();
		//
		useColor({ name: "secondary" });
		useColor({ name: "primary" });
		useGrid();
		useTags();
		//
		this.handleEvents();
		await this.checkUpdate();
	}

	private handleEvents() {
		// returns Promise
		hollow.events.on("database", (request: DataBaseRequest) => {
			const {
				pluginName,
				version = 1,
				stores = [{ name: "cards" }],
				callback,
			} = request;
			const pluginDB = new ToolDataBase(pluginName, version, stores);
			callback(pluginDB);
		});

		const requestStore = (props: StoreType): Promise<IStore> => {
			return Storage.create(props);
		};
		// returns a function that returns Promise<IStore>
		hollow.events.emit("store", requestStore);
	}

	async checkUpdate(manual?: boolean, debounce?: () => void) {
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

		if (this.downloading) {
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
					await this.update(update);
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
								await this.update(update);
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

	private async update(update: Update) {
		if (this.downloading) return;
		this.downloading = true;

		let downloaded = 0;
		let contentLength = 0;

		try {
			await update.downloadAndInstall((event) => {
				switch (event.event) {
					case "Started":
						contentLength = event.data.contentLength;
						console.log(
							`started downloading ${contentLength} bytes`,
						);
						break;

					case "Progress":
						downloaded += event.data.chunkLength;
						console.log(
							`downloaded ${downloaded} / ${contentLength}`,
						);
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
			this.downloading = false;
		}
	}

	register(handler: ShutdownHandler): () => void {
		this.handlers.add(handler);
		return () => this.handlers.delete(handler);
	}

	private async handleClose(event: CloseRequestedEvent) {
		if (this.closing) return;
		this.closing = true;
		event.preventDefault();
		try {
			await Promise.all(
				Array.from(this.handlers).map((fn) =>
					Promise.resolve().then(fn),
				),
			);
		} catch (err) {
			console.error("Shutdown handler failed:", err);
		}
		this.unlisten?.();
		await getCurrentWindow().close();
	}
}
