import { TagType } from "@app/type/hollow";
import { Realm } from "@app/type/Realm";

//
export type SettingsConfig = {
	"grid-size": number;
	"grid-gap": number;
	"code-theme": string;
	"custom-tags": TagType[];
	"enable-unverified-plugins": boolean;
	"hotkeys-enabled": boolean;
	"enable-dev-tools": boolean;
	"load-unsigned-plugins": boolean;
	realm?: Realm;
};
export type SettingsKey = keyof SettingsConfig;

//

export type Events = { domain: "settings" } & (
	| {
			type: "set-configs";
			configs: Partial<SettingsConfig>;
	  }
	| {
			type: "update-colors";
			colors: any;
	  }
);
