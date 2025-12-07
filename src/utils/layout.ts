import { Layout, LayoutSignal, PanelMap, PanelType } from "@type/hollow";
import { hollow } from "hollow";
import { Component, createEffect, lazy, on } from "solid-js";
import { createStore } from "solid-js/store";
import { PanelWrapper } from "./PanelWrapper";
//
const Expand = lazy(() => import("@components/ui/sidebars/Expand"));
const Character = lazy(() => import("@components/ui/sidebars/Character"));
const Editor = lazy(() => import("@components/ui/sidebars/Editor"));
const Notifications = lazy(async () => import("@components/ui/Notifications"));

export function createLayout(): Layout {
	const [layout, setLayout] = createStore<LayoutSignal>({
		left: {
			visible: false,
			current: "expand",
			panels: ["expand", "character", "wrapper"],
		},
		right: {
			visible: false,
			current: "editor",
			panels: ["editor", "notifications", "wrapper"],
		},
	});

	const panels: Record<PanelType, PanelMap> = {
		left: { wrapper: PanelWrapper, expand: Expand, character: Character },
		right: {
			wrapper: PanelWrapper,
			editor: Editor,
			notifications: Notifications,
		},
	};

	const addPanel = (type: PanelType, name: string, component: Component) => {
		panels[type][name] = component;
		setLayout(type, "panels", (list) =>
			list.includes(name) ? list : [...list, name],
		);
	};
	const add_layout = async (props: {
		type: PanelType;
		id: string;
	}): Promise<{ close: () => void }> => {
		const mounted = new Promise<void>((resolve) => {
			hollow.promises.set(props.type, { resolve, id: props.id });
		});
		setLayout(props.type, { visible: true, current: "wrapper" });
		await mounted;
		return {
			close: () => {
				setLayout(props.type, "visible", false);
			},
		};
	};
	hollow.events.emit("add-layout", add_layout);

	const removePanel = (type: PanelType, name: string) => {
		setLayout(type, "panels", (list) => list.filter((i) => i !== name));

		setLayout(type, (side) => ({
			...side,
			current: side.current === name ? undefined : side.current,
		}));

		delete panels[type][name];
	};

	const selectPanel = (type: PanelType, name: string) => {
		if (!layout[type].panels.includes(name)) return;
		if (layout[type].current === name && layout[type].visible) {
			togglePanel(type);
			return;
		}
		setLayout(type, "current", name);
		setLayout(type, "visible", true);
	};

	const togglePanel = (type: PanelType) => {
		setLayout(type, "visible", (v) => !v);
	};

	const isPanelVisible = (type: PanelType, name: string) => {
		const target = layout[type];
		return target.visible && target.current === name;
	};

	return {
		get: layout,
		addPanel,
		removePanel,
		selectPanel,
		togglePanel,
		panels,
		isPanelVisible,
	};
}
