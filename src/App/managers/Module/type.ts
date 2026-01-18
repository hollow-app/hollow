import { CardType, PluginResult, ToolApi } from "@type/hollow";
import { hollow } from "../../../hollow";
import { Part } from "solid-js/store";

export type ModuleState = {
	instances: CardType[];
};

export type Events = { domain: "module" } & (
	| {
			type: "set-instances";
			instances: CardType[];
	  }
	| {
			type: "install-module";
			name: string;
			repo: string;
			isUpdate?: boolean;
	  }
	| {
			type: "uninstall-module";
			name: string;
	  }
	| {
			type: "add-instance";
			name: string;
			toolName: string;
			emoji: string;
	  }
	| {
			type: "remove-instance";
			cardIds: string[];
			toolName: string;
			fs?: boolean;
	  }
	| {
			type: "update-instance";
			toolName: string;
			cardId: string;
			updates?: Record<string, any>;
			rect?: Partial<{
				x: number;
				y: number;
				width: number;
				height: number;
			}>;
	  }
	| {
			type: "toggle-instance";
			id: string;
			toolName: string;
	  }
	| {
			type: "change-emoji";
			emoji: string;
			cardId: string;
			toolName: string;
	  }
	| {
			type: "update-instances";
			cardsToUpdate: { toolName: string; cards: CardType[] }[];
	  }
	| {
			type: "load-instance";
			cardInfo: CardType;
			toolName: string;
	  }
);

export type ToolMethods = {
	name: string;
	onCreate(card: CardType): Promise<PluginResult>;
	onDelete(card: CardType): Promise<PluginResult>;
	onLoad(card: CardType): Promise<PluginResult>;
	onUnload(name: string): Promise<PluginResult>;
	toolEvent: ToolApi;
};
export type ToolMap = Map<string, ToolMethods>;
export type CoreTool = (typeof hollow.coreTools)[number];
