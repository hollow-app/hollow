import { TagType } from "@app/type/hollow";
import { GridStackOptions } from "gridstack";

// Domain States
export interface ContextState {
	tags: TagType[];
	isFocus: boolean;
	isLiveEditor: boolean;
	canvasConfigs: GridStackOptions;
	isSettingsVisible: boolean | string;
	isVaultVisible:
		| {
				onSelect?: (path: string) => void;
		  }
		| undefined;
	editorInstance?: {
		module: string;
		id: string;
	};
}

export type ContextEvents = { domain: "context" } & (
	| { type: "set-tags"; tags: TagType[] }
	| { type: "set-focus"; focus: boolean }
	| {
			type: "set-canvas-configs";
			configs: GridStackOptions;
	  }
	| {
			type: "toggle-settings";
			value?: boolean | string;
	  }
	| {
			type: "toggle-vault";
			value?: { onSelect?: (p: string) => void };
	  }
	| {
			type: "edit-instance";
			instance: { id: string; module: string };
	  }
);
