import { TagType } from "../type/hollow";
import { GridStackOptions } from "gridstack";
import { ContextEvents } from "./type";

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
