import { Component, lazy } from "solid-js";
import { LayoutEvents, LayoutState, LayoutVariant } from "./types";
import { _dispatch, _state } from "@shared/store/effects";
import { hollow } from "../../../hollow";
import { RootState } from "@shared/store/types";
import { LayoutWrapper } from "./utils/LayoutWrapper";
import {
	CapabilityMeta,
	LayoutCapability,
	LayoutCapabilityMeta,
	PluginCapability,
} from "@app/type/hollow";
import { DispatchType } from "@shared/store";

const Expand = lazy(() => import("@app/components/layout-ui/sidebars/Expand"));
const Character = lazy(
	() => import("@app/components/layout-ui/sidebars/Character"),
);
const Editor = lazy(() => import("@app/components/layout-ui/sidebars/Editor"));
const Notifications = lazy(
	async () => import("@app/components/layout-ui/Notifications"),
);

export type PanelMap = Record<
	string,
	{ Component: Component; meta?: LayoutCapabilityMeta }
>;

export interface Panels {
	left: PanelMap;
	right: PanelMap;
}

const panels: Panels = {
	left: { expand: { Component: Expand }, account: { Component: Character } },
	right: {
		editor: { Component: Editor },
		notifications: { Component: Notifications },
	},
};

export function getLayoutCore() {
	return panels;
}
export function setupLayout(dispatch: DispatchType, get: () => RootState) {
	const sortCapas = (capa: PluginCapability[]) => {
		const newLayouts = capa.filter((i) => i.kind === "layout");
		if (newLayouts.length > 0) {
			for (const capa of newLayouts) {
				addLayout(dispatch, capa);
			}
		}
	};
	hollow.pevents.on("post-capabilities", () => {
		const capabilities = hollow.pevents.getData("capabilities");
		sortCapas(capabilities);
	});
	hollow.pevents.on("push-capabilities", async (capabilities) => {
		sortCapas(capabilities);
	});
}

export function layoutEffects(action: LayoutEvents, state: LayoutState) {
	if (action.domain !== "layout") return;
	switch (action.type) {
		case "remove-panel":
			delete panels[action.variant][action.id];
			break;
	}
}
function addLayout(dispatch: DispatchType, capa: PluginCapability) {
	if (capa.kind !== "layout") return;
	const variant = capa.meta.variant;
	const id = capa.meta.id;
	const targetSide: PanelMap | undefined = panels[variant];
	if (!variant || !targetSide || !id) return;
	targetSide[id] = {
		Component: LayoutWrapper({ main: capa.handler }),
		meta: capa.meta as LayoutCapabilityMeta,
	};
	dispatch({
		domain: "layout",
		type: "add-panel",
		variant,
		id,
	});
}

export function removePanel(type: LayoutVariant, name: string) {
	_dispatch({
		domain: "layout",
		type: "remove-panel",
		variant: type,
		id: name,
	});
}

export function selectPanel(type: LayoutVariant, name: string) {
	_dispatch({
		domain: "layout",
		type: "select-panel",
		variant: type,
		id: name,
	});
}

export function togglePanel(type: LayoutVariant) {
	_dispatch({
		domain: "layout",
		type: "toggle-panel",
		variant: type,
	});
}

export function isPanelVisible(
	state: RootState,
	type: LayoutVariant,
	name: string,
): boolean {
	const layout = state.layout;
	const target = layout[type];
	return target.visible && target.current === name;
}

export function anyExtraPanels(): boolean {
	const state = _state();
	if (!state) return false;
	const layout = state.layout;
	return layout.left.panels.length > 2 || layout.right.panels.length > 2;
}
