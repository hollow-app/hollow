import { ContextMenuItem } from "@type/hollow";
import { EditorKitType } from "@type/EditorKitType";
import { KitType } from "@type/hollow";
import { createMemo, createSignal, onCleanup, onMount, Setter } from "solid-js";
import { Opthand } from "@type/Opthand";
import { hollow } from "hollow";
import { PartialOptions } from "overlayscrollbars";

type CardProps = {
	cardInfo: Opthand;
	container: HTMLDivElement;
	setScrollOptions: Setter<PartialOptions>;
};

export default function Card({
	cardInfo,
	container,
	setScrollOptions,
}: CardProps) {
	let vault!: HTMLDivElement;
	const [kit, setKit] = createSignal<KitType>(cardInfo.kit);
	const [isLoaded, setLoaded] = createSignal(false);
	const [isExpand, setExpand] = createSignal(false);
	const editorKit = createMemo<EditorKitType>(() => ({
		tool: cardInfo.tool,
		card: cardInfo.name,
		it: cardInfo.kit,
		setIt: setKit,
		save: () =>
			hollow.toolManager.changeKit(kit(), cardInfo.id, cardInfo.tool),
	}));
	const [dragInfo, setDragInfo] = createSignal(null);

	const onMouseDown = (e: MouseEvent) => {
		if (
			vault &&
			document.getElementById("root").classList.contains("dnd-mode")
		) {
			const { left, top } = vault.getBoundingClientRect();
			setDragInfo({
				x: e.clientX - left,
				y: e.clientY - top,
			});

			container.addEventListener("mousemove", onMouseMoveInCanvas);
			container.addEventListener("mouseup", onMouseUp);
		}
	};

	const onMouseUp = () => {
		if (dragInfo()) {
			container.removeEventListener("mousemove", onMouseMoveInCanvas);
			container.removeEventListener("mouseup", onMouseUp);
			setDragInfo(null);
			// TODO hm
			hollow.toolManager.changeKit(kit(), cardInfo.id, cardInfo.tool);
		}
	};

	const onMouseMoveInCanvas = (e: MouseEvent) => {
		const { left, top } = container.getBoundingClientRect();
		const { cw, rh } = hollow.canvas_grid;
		const x = Math.round((e.clientX - left - dragInfo().x) / cw);
		const y = Math.round((e.clientY - top - dragInfo().y) / rh);
		if (x < 0 || y < 0) {
			return;
		}
		setKit((prev: KitType) => ({
			...prev,
			xyz: { ...prev.xyz, x: x, y: y },
		}));
	};

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
		if (state) {
			setScrollOptions((prev) => ({
				...prev,
				scrollbars: { ...prev.scrollbars, visibility: "hidden" },
				overflow: {
					x: "hidden",
					y: "hidden",
				},
			}));
		} else {
			setScrollOptions((prev) => ({
				...prev,
				scrollbars: { ...prev.scrollbars, visibility: "auto" },
				overflow: {
					x: "scroll",
					y: "scroll",
				},
			}));
		}
		setExpand(state);
	};

	const showEditor = () => {
		hollow.events.emit("editor", editorKit());
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
		hollow.toolManager.addEditorKit(editorKit());
		setLoaded(await hollow.toolManager.loadCard(cardInfo, cardInfo.tool));
		hollow.toolManager
			.getToolEvents(cardInfo.tool)
			.on(`${cardInfo.id}-expand`, showExpand);
	});

	onCleanup(() => {
		container.removeEventListener("mousemove", onMouseMoveInCanvas);
		container.removeEventListener("mouseup", onMouseUp);
		hollow.toolManager
			.getToolEvents(cardInfo.tool)
			.off(`${cardInfo.id}-expand`, showExpand);
	});
	return (
		<div
			ref={vault}
			class={"box-border transition-all"}
			style={{
				...(isExpand()
					? {
							top: 0,
							left: 0,
							width: "calc(100vw - calc(var(--spacing) * 20) - 2px)",
							height: "calc(100vh - calc(var(--spacing) * 4) - 2px)",
						}
					: {
							left: `calc(var(--cw) * ${kit().xyz.x})`,
							top: `calc(var(--rh) * ${kit().xyz.y})`,
							width: `calc(var(--cw) * ${kit().width})`,
							height: `calc(var(--rh) * ${kit().height})`,
							padding: kit().extra?.outerMargin ?? "0",
						}),
				position: isExpand() ? "sticky" : "absolute",
				"z-index": dragInfo || isExpand() ? "999" : kit().xyz.z,
				cursor: dragInfo() ? "move" : "default",
				"pointer-events": dragInfo() ? "none" : "auto",
			}}
			oncontextmenu={onContextMenu}
			onPointerDown={onMouseDown}
		>
			<div
				id={cardInfo.id}
				class="border-secondary-20 h-full w-full border-1"
				style={{
					"--opacity": `${kit().opacity * 100}%`,
					"--border-radius": `${kit().corner}px`,
					"--border-color": kit().border.c,
					"--border-width": `${kit().border.n}px`,
					"--outer-margin": kit().extra?.outerMargin ?? "0",
					"border-radius": "var(--border-radius)",
					"border-color": "var(--border-color)",
					"border-style": "solid",
					"border-width": "var(--border-width)",
					...kit().extra,
					...(isExpand() && {
						"border-width": 0,
					}),
				}}
				classList={{
					"backdrop-blur-sm": kit().glass,
					"card-spot": !isLoaded(),
				}}
			></div>
		</div>
	);
}
