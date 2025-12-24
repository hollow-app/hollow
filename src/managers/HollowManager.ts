import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";
import { hollow } from "hollow";
import { ToolManager } from "./ToolManager";
import { useColor } from "@hooks/useColor";
import useTags from "@hooks/useTags";
import { DataBaseRequest, IStore, StoreType } from "@type/hollow";
import { ToolDataBase } from "./ToolDataBase";
import { Storage } from "./Storage";
import useGrid from "@hooks/useGrid";
import { manager, Managers } from ".";

export class HollowManager {
	private readonly managers: Managers;

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
		await this.managers?.markdown.start();
		//
		useColor({ name: "primary" });
		useColor({ name: "secondary" });
		useGrid();
		useTags();
		//
		this.handleEvents();
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
}
