import { TagType } from "@type/hollow";
import { GridStackOptions } from "gridstack";

// Domain States
export interface ContextState {
	tags: TagType[];
	isFocus: boolean;
	isLiveEditor: boolean;
	canvasConfigs: GridStackOptions;
}

export type ContextEvents =
	| { domain: "context"; type: "set-tags"; tags: TagType[] }
	| { domain: "context"; type: "set-focus"; focus: boolean }
	| {
			domain: "context";
			type: "set-canvas-configs";
			configs: GridStackOptions;
	  };
