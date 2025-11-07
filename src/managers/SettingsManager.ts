import { TagType } from "@type/hollow";
import { RealmManager } from "./RealmManager";
import { join } from "@tauri-apps/api/path";
import { Storage } from "./Storage";
import DEFAULT from "@assets/configs/settings.json?raw";

type SettingsConfig = {
	columns: number;
	offcolumns: number;
	rows: number;
	offrows: number;
	"static-grid-lines": boolean;
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
	private readonly realmId = RealmManager.getSelf().getCurrent(false);
	private settings: SettingsConfig;
	private constructor() {
		this.settings = JSON.parse(
			localStorage.getItem(`${this.realmId}-settigs`) ?? DEFAULT,
		);
	}
	static getSelf() {
		if (!this.self) {
			this.self = new SettingsManager();
		}
		return this.self;
	}

	getConfig<K extends SettingsKey>(key: K): SettingsConfig[K] {
		return this.settings[key];
	}
	getConfigs<K extends SettingsKey>(keys: K[]): Pick<SettingsConfig, K> {
		const result = {} as Pick<SettingsConfig, K>;
		for (const key of keys) {
			result[key] = this.settings[key];
		}
		return result;
	}
	setConfig<K extends SettingsKey>(key: K, value: SettingsConfig[K]) {
		this.settings[key] = value;
		this.update();
	}
	setConfigs<K extends SettingsKey>(configs: Pick<SettingsConfig, K>) {
		for (const key in configs) {
			if (Object.prototype.hasOwnProperty.call(configs, key)) {
				this.settings[key as K] = configs[key as K];
			}
		}
	}
	private update() {
		localStorage.setItem(
			`${this.realmId}-settings`,
			JSON.stringify(this.settings),
		);
	}
}
