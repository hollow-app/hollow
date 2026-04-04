import { TagType } from "../type/hollow";
import { GridStackOptions } from "gridstack";
import { ContextEvents } from "./type";
import { _dispatch } from "@app/store/effects";

export const setTags = (tags: TagType[]): ContextEvents => ({
	domain: "context",
	type: "set-tags",
	tags,
});

export const setFocus = (focus: boolean): ContextEvents => ({
	domain: "context",
	type: "set-focus",
	focus,
});

export const setCanvasConfigs = (configs: GridStackOptions): ContextEvents => ({
	domain: "context",
	type: "set-canvas-configs",
	configs,
});

export const toggleVault = (onSelect?: (p: string) => void) => {
	_dispatch({
		domain: "context",
		type: "toggle-vault",
		value: onSelect ? { onSelect } : undefined,
	});
};
