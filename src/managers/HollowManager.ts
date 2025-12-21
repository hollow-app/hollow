import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";
import { hollow } from "hollow";
import { CharacterManager } from "./CharacterManager";
import VaultManager from "./VaultManager";
import { RustManager } from "./RustManager";
import { ToolManager } from "./ToolManager";
import { useColor } from "@hooks/useColor";
import { RealmManager } from "./RealmManager";
import useTags from "@hooks/useTags";
import { NotifyManager } from "./NotifyManager";
import { DataBaseRequest, IStore, StoreType } from "@type/hollow";
import { ToolDataBase } from "./ToolDataBase";
import { hotkeysManager } from "./HotkeysManager";
import { CodeThemeManager } from "./CodeThemeManager";
import { SettingsManager } from "./SettingsManager";
import { MarkdownManager } from "./MarkdownManager";
import { Storage } from "./Storage";
import { DeepLinkManager } from "./DeepLinkManager";
import useGrid from "@hooks/useGrid";

export class HollowManager {
	private static self: HollowManager;
	private isOnline: boolean;
	static getSelf() {
		if (!this.self) {
			this.self = new HollowManager();
		}
		return this.self;
	}

	private constructor() {
		this.isOnline = navigator.onLine;
		hollow.events.emit("network-state", this.isOnline);
		window.addEventListener("offline", () => {
			this.isOnline = false;
			hollow.events.emit("network-state", false);
		});
		window.addEventListener("online", () => {
			this.isOnline = true;
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
			await RustManager.getSelf().first_launch();
		}
		await RealmManager.getSelf().start();
		hotkeysManager.init();
		DeepLinkManager.init();
		await CharacterManager.getSelf().start();
		return true;
	}

	async postRealmSelection() {
		if (!localStorage.platform) {
			localStorage.platform = await RustManager.getSelf().get_platform();
		}
		await VaultManager.getSelf().start();
		await RustManager.getSelf().start_realm({
			location: RealmManager.getSelf().getCurrent().location,
		});
		//
		await SettingsManager.getSelf().start();
		hollow.toolManager = await ToolManager.create(
			SettingsManager.getSelf().getConfig("load-unsigned-plugins"),
		);
		await MarkdownManager.getSelf().start();
		NotifyManager.init();
		CodeThemeManager.init();
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
