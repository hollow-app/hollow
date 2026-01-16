import { hollow } from "hollow";
import { Accessor, batch, Component, createMemo, lazy } from "solid-js";
import { createStore } from "solid-js/store";
//
const Expand = lazy(() => import("@components/layout-ui/sidebars/Expand"));
const Character = lazy(
	() => import("@components/layout-ui/sidebars/Character"),
);
const Editor = lazy(() => import("@components/layout-ui/sidebars/Editor"));
const Notifications = lazy(
	async () => import("@components/layout-ui/Notifications"),
);

export type PanelType = "left" | "right";

export type PanelMap = Record<string, Component>;

export interface SideLayout {
	visible: boolean;
	current?: string;
	panels: string[];
}

export interface LayoutSignal {
	left: SideLayout;
	right: SideLayout;
}
interface Panels {
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

export interface Layout {
	get: LayoutSignal;
	addPanel: (type: PanelType, name: string, component: Component) => void;
	removePanel: (type: PanelType, id: string) => void;
	selectPanel: (type: PanelType, id: string) => void;
	togglePanel: (type: PanelType) => void;
	isPanelVisible: (type: PanelType, name: string) => boolean;
	panels: Panels;
	anyExtraPanels: Accessor<boolean>;
}

export function createLayout(): Layout {
	const [layout, setLayout] = createStore<LayoutSignal>({
		left: {
			visible: false,
			current: "expand",
			panels: ["expand", "character"],
		},
		right: {
			visible: false,
			current: "editor",
			panels: ["editor", "notifications"],
		},
	});
	const anyExtraPanels = createMemo(() => {
		return layout.left.panels.length > 2 || layout.right.panels.length > 2;
	});

	const panels: Panels = {
		left: { expand: Expand, character: Character },
		right: {
			editor: Editor,
			notifications: Notifications,
		},
		extra: [],
	};

	const addPanel = (type: PanelType, name: string, component: Component) => {
		panels[type][name] = component;
		setLayout(type, "panels", (list) =>
			list.includes(name) ? list : [...list, name],
		);
	};
	const add_layout = (props: {
		type: PanelType;
		id: string;
		icon: any;
		mount: (el: HTMLDivElement) => { unmount: () => void };
		tooltip?: string;
	}): {
		close: () => void;
		isOpen: () => boolean;
	} => {
		if (layout[props.type].panels.includes(props.id)) return;
		const close = () => {
			batch(() => {
				setLayout(props.type, "panels", (p) =>
					p.filter((i) => i !== props.id),
				);
				setLayout(props.type, "visible", false);
			});
			panels.extra = panels.extra.filter((i) => i.id !== props.id);
			hollow.promises.delete(props.id);
		};
		panels.extra.push(props);
		setLayout(props.type, "panels", (l) => [...l, props.id]);
		return {
			close,
			isOpen: () => isPanelVisible(props.type, props.id),
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
		// if (!layout[type].panels.includes(name)) return;
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
		anyExtraPanels,
	};
}
