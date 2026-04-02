import { Component } from "solid-js";

export type LayoutVariant = "left" | "right";

export interface SideLayout {
	visible: boolean;
	current?: string;
	panels: string[];
}

export interface LayoutState {
	left: SideLayout;
	right: SideLayout;
}

export type LayoutEvents = { domain: "layout" } & (
	| {
			type: "add-panel";
			variant: LayoutVariant;
			id: string;
	  }
	| {
			type: "remove-panel";
			variant: LayoutVariant;
			id: string;
	  }
	| {
			type: "select-panel";
			variant: LayoutVariant;
			id: string;
	  }
	| {
			type: "toggle-panel";
			variant: LayoutVariant;
	  }
	| {
			type: "set-visibility";
			variant: LayoutVariant;
			visible: boolean;
	  }
);
