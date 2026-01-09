import {
	createContext,
	useContext,
	createSignal,
	JSX,
	Accessor,
	Setter,
	onMount,
	onCleanup,
} from "solid-js";
import { TagType } from "./type/hollow";
import { manager } from "./managers/index";
import { hollow } from "hollow";
import { GridStackOptions } from "gridstack";
import { createMemo } from "solid-js";

interface HollowContextValue {
	tags: Accessor<TagType[]>;
	setTags: Setter<TagType[]>;
	isFocus: Accessor<boolean>;
	setFocus: Setter<boolean>;
	canvasConfigs: Accessor<GridStackOptions>;
	setCanvasConfigs: Setter<GridStackOptions>;
	isLiveEditor: Accessor<boolean>;
}
const HollowContext = createContext<HollowContextValue>();

export function HollowProvider(props: { children: JSX.Element }) {
	const settingsManager = manager.settings;
	const [tags, setTags] = createSignal<TagType[]>(
		settingsManager.getConfig("custom-tags"),
	);
	const [isFocus, setFocus] = createSignal<boolean>(false);
	const [canvasConfigs, setCanvasConfigs] = createSignal<GridStackOptions>({
		disableResize: true,
		disableDrag: true,
		float: true,
		column: settingsManager.getConfig("grid-size"),
		cellHeight:
			(window.innerHeight - 16 + settingsManager.getConfig("grid-gap")) /
			settingsManager.getConfig("grid-size"),
	});

	const isLiveEditor = createMemo(() => !canvasConfigs().disableDrag);

	//
	const value: HollowContextValue = {
		tags,
		setTags,
		isFocus,
		setFocus,
		canvasConfigs,
		setCanvasConfigs,
		isLiveEditor,
	};

	//
	const onUpdateTags = (tags: TagType[]) => {
		setTags([...tags]);
	};
	onMount(() => {
		hollow.events.on("tags", onUpdateTags);
	});
	onCleanup(() => {
		hollow.events.on("tags", onUpdateTags);
	});
	return (
		<HollowContext.Provider value={value}>
			{props.children}
		</HollowContext.Provider>
	);
}

export function useHollow() {
	const context = useContext(HollowContext);
	if (!context) {
		throw new Error("useHollow must be used within a HollowProvider");
	}
	return context;
}
