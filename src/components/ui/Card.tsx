import { CardType, ContextMenuItem } from "@type/hollow";
import { createSignal, onCleanup, onMount, Setter } from "solid-js";
import { hollow } from "hollow";

interface CardProps {
	node: CardType;
}
export default function Card(props: CardProps) {
	const tool = props.node.data.extra.tool;
	let vault!: HTMLDivElement;
	const [isLoaded, setLoaded] = createSignal(false);
	const [isExpand, setExpand] = createSignal(false);

	const onContextMenu = () => {
		const cmItems: ContextMenuItem = {
			id: `vault`,
			header: "Card",
			items: [
				{
					icon: "Expand",
					label: "Focus Mode",
					onclick: () => expand(),
				},
				{
					icon: "PencilRuler",
					label: "Modify",
					onclick: showEditor,
				},
				{
					icon: "Settings",
					label: "Settings",
					onclick: showSettings,
				},
			],
		};
		hollow.events.emit("context-menu-extend", cmItems);
	};

	const showExpand = (state: boolean) => {
		// if (state) {
		// 	setScrollOptions((prev) => ({
		// 		...prev,
		// 		scrollbars: { ...prev.scrollbars, visibility: "hidden" },
		// 		overflow: {
		// 			x: "hidden",
		// 			y: "hidden",
		// 		},
		// 	}));
		// } else {
		// 	setScrollOptions((prev) => ({
		// 		...prev,
		// 		scrollbars: { ...prev.scrollbars, visibility: "auto" },
		// 		overflow: {
		// 			x: "scroll",
		// 			y: "scroll",
		// 		},
		// 	}));
		// }
		setExpand(state);
	};

	const showEditor = () => {
		hollow.pevents.emit("editor", {
			tool: tool,
			cardId: props.node.id,
		});
		hollow.events.emit("context-menu", false);
	};
	const showSettings = () => {
		hollow.toolManager
			.getToolEvents(tool)
			.emit(`${props.node.id}-settings`, true);
		hollow.events.emit("context-menu", false);
	};
	const expand = () => {
		hollow.toolManager
			.getToolEvents(tool)
			.toggle(`${props.node.id}-expand`);
	};
	onMount(async () => {
		setLoaded(await hollow.toolManager.loadCard(props.node, tool));
		hollow.toolManager
			.getToolEvents(tool)
			.on(`${props.node.id}-expand`, showExpand);
	});
	onCleanup(() => {
		hollow.toolManager
			.getToolEvents(tool)
			.off(`${props.node.id}-expand`, showExpand);
	});
	return (
		<div
			ref={vault}
			class={"z-50 box-border h-full w-full"}
			style={{
				...(isExpand()
					? {
							top: 0,
							left: 0,
							width: "calc(100vw - calc(var(--spacing) * 20) - 2px)",
							height: "calc(100vh - calc(var(--spacing) * 4) - 2px)",
							"z-index": 999,
						}
					: {}),
				position: isExpand() ? "sticky" : "static",
			}}
			onContextMenu={onContextMenu}
		>
			<div
				id={props.node.id}
				class="h-full w-full"
				classList={{
					"card-spot": !isLoaded(),
				}}
			></div>
		</div>
	);
}
