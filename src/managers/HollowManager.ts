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
import { DataBaseRequest } from "@type/hollow";
import { ToolDataBase } from "./ToolDataBase";
import { hotkeysManager } from "./HotkeysManager";
import { CodeThemeManager } from "./CodeThemeManager";
import { DeepLinkManager } from "./DeepLinkManager";
import { SettingsManager } from "./SettingsManager";

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
	}

	async preRealmSelection() {
		if (!localStorage.realmToggleOnStartup) {
			localStorage.realmToggleOnStartup = "false";
		}
		hotkeysManager.init();
		await VaultManager.getSelf().start();
		await CharacterManager.getSelf().start();
		return true;
	}

	async postRealmSelection() {
		if (!localStorage.platform) {
			localStorage.platform = await RustManager.getSelf().get_platform();
		}
		const devData = this.handleDev();
		//
		hollow.toolManager = await ToolManager.create(devData.loadunsigned);
		NotifyManager.init();
		CodeThemeManager.init();
		// DeepLinkManager.init();
		await EntryManager.getSelf().start();
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
	}

	private handleDev() {
		const key = `${RealmManager.getSelf().getCurrent()}-dev`;
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
