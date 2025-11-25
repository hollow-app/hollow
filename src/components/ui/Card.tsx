import { ContextMenuItem } from "@type/hollow";
import { createSignal, onCleanup, onMount, Setter } from "solid-js";
import { Opthand } from "@type/Opthand";
import { hollow } from "hollow";
import { PartialOptions } from "overlayscrollbars";

type CardProps = {
	cardInfo: Opthand;
};

export default function Card(cardInfo: Opthand) {
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
			tool: cardInfo.tool,
			cardId: cardInfo.id,
		});
		hollow.events.emit("context-menu", false);
	};
	const showSettings = () => {
		hollow.toolManager
			.getToolEvents(cardInfo.tool)
			.emit(`${cardInfo.id}-settings`, true);
		hollow.events.emit("context-menu", false);
	};
	const expand = () => {
		hollow.toolManager
			.getToolEvents(cardInfo.tool)
			.toggle(`${cardInfo.id}-expand`);
	};
	onMount(async () => {
		setLoaded(await hollow.toolManager.loadCard(cardInfo, cardInfo.tool));
		hollow.toolManager
			.getToolEvents(cardInfo.tool)
			.on(`${cardInfo.id}-expand`, showExpand);
	});
	onCleanup(() => {
		hollow.toolManager
			.getToolEvents(cardInfo.tool)
			.off(`${cardInfo.id}-expand`, showExpand);
	});
	return (
		<div
			ref={vault}
			class={"box-border h-full w-full"}
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
				position: isExpand() ? "sticky" : "absolute",
			}}
			oncontextmenu={onContextMenu}
		>
			<div
				id={cardInfo.id + "-i"}
				class="h-full w-full"
				classList={{
					"card-spot": !isLoaded(),
				}}
			></div>
		</div>
	);
}
