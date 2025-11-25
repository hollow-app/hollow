import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";
import { hollow } from "hollow";
import { CharacterManager } from "./CharacterManager";
import VaultManager from "./VaultManager";
import { RustManager } from "./RustManager";
import { ToolManager } from "./ToolManager";
import { EntryManager } from "./EntryManager";
import { useColor } from "@hooks/useColor";
import setStyle from "@hooks/setStyle";
import { RealmManager } from "./RealmManager";
import { useBackground } from "@hooks/useBackground";
import useTags from "@hooks/useTags";
import { NotifyManager } from "./NotifyManager";
import { DataBaseRequest, IStore, StoreType } from "@type/hollow";
import { ToolDataBase } from "./ToolDataBase";
import { hotkeysManager } from "./HotkeysManager";
import { CodeThemeManager } from "./CodeThemeManager";
import { SettingsManager } from "./SettingsManager";
import { MarkdownManager } from "./MarkdownManager";
import { Storage } from "./Storage";

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
		for (const method of Object.keys(logMap) as ConsoleMethod[]) {
			const original = console[method].bind(console);
			const forward = logMap[method];
			console[method] = (...args: unknown[]) => {
				original(...args);
				const message = args
					.map((a) =>
						typeof a === "object"
							? JSON.stringify(a, null, 2)
							: String(a),
					)
					.join(" ");
				void forward(message);
			};
		}
	}

	async preRealmSelection() {
		if (!localStorage.realmToggleOnStartup) {
			localStorage.realmToggleOnStartup = "false";
			await RustManager.getSelf().first_launch();
		}
		await RealmManager.getSelf().start();
		hotkeysManager.init();
		await VaultManager.getSelf().start();
		await CharacterManager.getSelf().start();
		return true;
	}

	async postRealmSelection() {
		if (!localStorage.platform) {
			localStorage.platform = await RustManager.getSelf().get_platform();
		}
		await RustManager.getSelf().start_realm({
			location: RealmManager.getSelf().getCurrent().location,
		});
		const devData = this.handleDev();
		//
		hollow.toolManager = await ToolManager.create(devData.loadunsigned);
		await SettingsManager.getSelf().start();
		await EntryManager.getSelf().start();
		await MarkdownManager.getSelf().start();
		NotifyManager.init();
		CodeThemeManager.init();
		// DeepLinkManager.init();
		//
		useColor({ name: "primary" });
		useColor({ name: "secondary" });
		setStyle([
			{
				name: "--static-grid-lines",
				value: SettingsManager.getSelf().getConfig("static-grid-lines")
					? "var(--secondary-color-15)"
					: "transparent",
			},
		]);
		useBackground({});
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

	private handleDev() {
		const key = `${RealmManager.getSelf().currentRealmId}-dev`;
		const savedData: string | undefined = localStorage.getItem(key);
		let iniData = {
			devtools: false,
			loadunsigned: false,
		};

		if (savedData) {
			const parsedData: { devtools: boolean; loadunsigned: boolean } =
				JSON.parse(savedData);
			// parsedData.devtools &&
			//         RustManager.getSelf().devtools_status({ state: true });
			iniData = parsedData;
		} else {
			localStorage.setItem(key, JSON.stringify(iniData));
		}
		return iniData;
	}
}
