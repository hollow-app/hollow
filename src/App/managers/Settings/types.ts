import { TagType } from "@type/hollow";

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
};
export type SettingsKey = keyof SettingsConfig;

//

export type Events = { domain: "settings" } & {
	type: "set-configs";
	configs: Partial<SettingsConfig>;
};
