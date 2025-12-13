import { TagType } from "@type/hollow";
import { RealmManager } from "./RealmManager";
import { join } from "@tauri-apps/api/path";
import { Storage } from "./Storage";
import DEFAULT from "@assets/configs/settings.json?raw";

export type SettingsConfig = {
	"grid-gap": number;
	"background-image": string | null;
	"background-opacity": number;
	"code-theme": string;
	"custom-tags": TagType[];
	"enable-unverified-plugins": boolean;
	"hotkeys-enabled": boolean;
	"enable-dev-tools": boolean;
	"load-unsigned-plugins": boolean;
};
type SettingsKey = keyof SettingsConfig;

export class SettingsManager {
	private static self: SettingsManager;
	private store: Storage;

	async start() {
		const path = await join(
			...[
				RealmManager.getSelf().getCurrent().location,
				".hollow",
				"settings.json",
			],
		);
		this.store = await Storage.create({
			path,
			options: {
				defaults: JSON.parse(DEFAULT),
			},
		});
	}

	static getSelf() {
		if (!this.self) {
			this.self = new SettingsManager();
		}
		return this.self;
	}

	getConfig<K extends SettingsKey>(key: K): SettingsConfig[K] {
		return this.store.get(key);
	}
	getConfigs<K extends SettingsKey>(keys: K[]): Pick<SettingsConfig, K> {
		const result = {} as Pick<SettingsConfig, K>;
		for (const key of keys) {
			result[key] = this.store.get(key);
		}
		return result;
	}
	setConfig<K extends SettingsKey>(key: K, value: SettingsConfig[K]) {
		this.store.set(key, value);
	}

	setConfigs<K extends SettingsKey>(configs: Pick<SettingsConfig, K>) {
		this.store.setMany(configs);
	}
}
