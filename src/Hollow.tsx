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

interface HollowContextValue {
	tags: Accessor<TagType[]>;
	setTags: Setter<TagType[]>;
}
const HollowContext = createContext<HollowContextValue>();

export function HollowProvider(props: { children: JSX.Element }) {
	const [tags, setTags] = createSignal<TagType[]>(
		manager.settings.getConfig("custom-tags"),
	);
	const value: HollowContextValue = {
		tags,
		setTags,
	};
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
