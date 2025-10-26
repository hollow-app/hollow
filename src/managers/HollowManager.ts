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

export class HollowManager {
	private static self: HollowManager;

	static getSelf() {
		if (!this.self) {
			this.self = new HollowManager();
		}
		return this.self;
	}

	constructor() {}

	async preRealmSelection() {
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
		hollow.toolManager = await ToolManager.create(devData.loadunsigned);
		await EntryManager.getSelf().start();
		useColor({ name: "primary" });
		useColor({ name: "secondary" });
		setStyle([
			{
				name: "--static-grid-lines",
				value: JSON.parse(
					localStorage.getItem(
						`${RealmManager.getSelf().currentRealmId}-static-grid-lines`,
					) ?? "false",
				)
					? "var(--secondary-color-15)"
					: "transparent",
			},
		]);
		useBackground({});
		useTags();
		NotifyManager.init();
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
