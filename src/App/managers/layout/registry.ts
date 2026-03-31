import { Accessor, Component, createMemo, lazy } from "solid-js";
import { LayoutState, PanelType } from "./types";
import { _dispatch, _state } from "@shared/store/effects";
import { hollow } from "../../../hollow";
import { RootState } from "@shared/store/types";
import { CapabilityMeta, PanelCapability } from "@app/type/hollow";

const Expand = lazy(() => import("@app/components/layout-ui/sidebars/Expand"));
const Character = lazy(
	() => import("@app/components/layout-ui/sidebars/Character"),
);
const Editor = lazy(() => import("@app/components/layout-ui/sidebars/Editor"));
const Notifications = lazy(
	async () => import("@app/components/layout-ui/Notifications"),
);

export type PanelMap = Record<string, Component>;

type ExtraPanelType = { capability: PanelCapability; meta: CapabilityMeta };
export interface Panels {
	left: PanelMap;
	right: PanelMap;
	extra: ExtraPanelType[];
}

const panels: Panels = {
	left: { expand: Expand, account: Character },
	right: {
		editor: Editor,
		notifications: Notifications,
	},
	extra: [],
};

export function getLayoutPanels() {
	return panels;
}
export function setupLayoutRegistry(
	dispatch: (action: any) => void,
	get: () => RootState,
) {
	hollow.pevents.on("push-capabilities", async (capabilities) => {
		const newModules = capabilities.filter((i) => i.kind === "panel");
		if (newModules.length > 0) {
			for (const capa of newModules) {
				panels.extra.push({
					capability: capa.handler,
					meta: capa.meta,
				});
				dispatch({
					domain: "layout",
					type: "add-panel",
					side: capa.meta.side,
					id: capa.meta.id,
				});
			}
		}
	});
}

export function removePanel(type: PanelType, name: string) {
	delete panels[type][name];
	_dispatch({
		domain: "layout",
		type: "remove-panel",
		side: type,
		id: name,
	});
}

export function selectPanel(type: PanelType, name: string) {
	_dispatch({
		domain: "layout",
		type: "select-panel",
		side: type,
		id: name,
	});
}

export function togglePanel(type: PanelType) {
	_dispatch({
		domain: "layout",
		type: "toggle-panel",
		side: type,
	});
}

export function isPanelVisible(
	state: RootState,
	type: PanelType,
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
