import { Accessor, Component, createMemo, lazy } from "solid-js";
import { PanelType } from "./types";
import { batch } from "solid-js";

const Expand = lazy(() => import("@components/layout-ui/sidebars/Expand"));
const Character = lazy(
	() => import("@components/layout-ui/sidebars/Character"),
);
const Editor = lazy(() => import("@components/layout-ui/sidebars/Editor"));
const Notifications = lazy(
	async () => import("@components/layout-ui/Notifications"),
);

export type PanelMap = Record<string, Component>;

export interface Panels {
	left: PanelMap;
	right: PanelMap;
	extra: {
		type: PanelType;
		id: string;
		icon: any;
		mount: (el: HTMLDivElement) => { unmount: () => void };
		tooltip?: string;
	}[];
}

let dispatch: ((action: any) => void) | null = null;
let getState: (() => any) | null = null;

const panels: Panels = {
	left: { expand: Expand, character: Character },
	right: {
		editor: Editor,
		notifications: Notifications,
	},
	extra: [],
};

export function getLayoutPanels() {
	return panels;
}

export function setupLayoutRegistry(d: (action: any) => void, get: () => any) {
	dispatch = d;
	getState = get;

	// Setup add-layout event handler
	// TODO
	//hollow.events.emit("add-layout", add_layout);
}

export function addPanel(type: PanelType, name: string, component: Component) {
	panels[type][name] = component;
	if (dispatch) {
		dispatch({
			domain: "layout",
			type: "add-panel",
			side: type,
			id: name,
		});
	}
}

export function removePanel(type: PanelType, name: string) {
	delete panels[type][name];
	if (dispatch) {
		dispatch({
			domain: "layout",
			type: "remove-panel",
			side: type,
			id: name,
		});
	}
}

export function selectPanel(type: PanelType, name: string) {
	if (dispatch) {
		dispatch({
			domain: "layout",
			type: "select-panel",
			side: type,
			id: name,
		});
	}
}

export function togglePanel(type: PanelType) {
	if (dispatch) {
		dispatch({
			domain: "layout",
			type: "toggle-panel",
			side: type,
		});
	}
}

export function isPanelVisible(type: PanelType, name: string): boolean {
	if (!getState) return false;
	const state = getState();
	const layout = state.layout;
	const target = layout[type];
	return target.visible && target.current === name;
}

export function anyExtraPanels(): boolean {
	if (!getState) return false;
	const state = getState();
	const layout = state.layout;
	return layout.left.panels.length > 2 || layout.right.panels.length > 2;
}

function add_layout(props: {
	type: PanelType;
	id: string;
	icon: any;
	mount: (el: HTMLDivElement) => { unmount: () => void };
	tooltip?: string;
}): {
	close: () => void;
	isOpen: () => boolean;
} {
	if (!getState || !dispatch) {
		return {
			close: () => {},
			isOpen: () => false,
		};
	}

	const state = getState();
	const layout = state.layout;
	if (layout[props.type].panels.includes(props.id)) {
		return {
			close: () => {},
			isOpen: () => isPanelVisible(props.type, props.id),
		};
	}

	const close = () => {
		batch(() => {
			if (dispatch) {
				dispatch({
					domain: "layout",
					type: "remove-panel",
					side: props.type,
					id: props.id,
				});
				dispatch({
					domain: "layout",
					type: "set-visibility",
					side: props.type,
					visible: false,
				});
			}
		});
		panels.extra = panels.extra.filter((i) => i.id !== props.id);
	};

	panels.extra.push(props);
	if (dispatch) {
		dispatch({
			domain: "layout",
			type: "add-panel",
			side: props.type,
			id: props.id,
		});
	}

	return {
		close,
		isOpen: () => isPanelVisible(props.type, props.id),
	};
}
