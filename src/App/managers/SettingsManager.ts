import { TagType } from "@type/hollow";
import { join } from "@tauri-apps/api/path";
import { Storage } from "./Storage";
import DEFAULT from "@assets/configs/settings.json?raw";
import { Managers } from ".";

export type SettingsConfig = {
	"grid-size": number;
	"grid-gap": number;
	"code-theme": string;
	"custom-tags": TagType[];
	"enable-unverified-plugins": boolean;
	"hotkeys-enabled": boolean;
	"enable-dev-tools": boolean;
	"load-unsigned-plugins": boolean;
};
type SettingsKey = keyof SettingsConfig;

export class SettingsManager {
	private readonly managers: Managers;
	private store: Storage;

	constructor(managers: Managers) {
		this.managers = managers;
	}
	async start() {
		const path = await join(
			...[
				this.managers?.realm.getCurrent().location,
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
