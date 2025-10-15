import { ContextMenuItem } from "@type/ContextMenuItem";
import { EditorKitType } from "@type/EditorKitType";
import { KitType } from "@type/KitType";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

type VaultProps = {
	card: string;
	tool: string;
	canvas: HTMLDivElement;
	cardKit: KitType;
};

export default function Vault({ card, tool, canvas, cardKit }: VaultProps) {
	let vault!: HTMLDivElement;
	const [kit, setKit] = createSignal<KitType>(cardKit);
	const editorKit = createMemo<EditorKitType>(() => ({
		tool: tool,
		card: card,
		it: cardKit,
		setIt: setKit,
		save: () => window.toolManager.changeKit(kit(), card, tool),
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

			canvas.addEventListener("mousemove", onMouseMoveInCanvas);
			canvas.addEventListener("mouseup", onMouseUp);
		}
	};

	const onMouseUp = () => {
		if (dragInfo()) {
			canvas.removeEventListener("mousemove", onMouseMoveInCanvas);
			canvas.removeEventListener("mouseup", onMouseUp);
			setDragInfo(null);
			// TODO hm
			window.toolManager.changeKit(kit(), card, tool);
		}
	};

	const onMouseMoveInCanvas = (e: MouseEvent) => {
		const { left, top } = canvas.getBoundingClientRect();
		const { cw, rh } = window.canvas_grid;
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
		window.hollowManager.emit("context-menu-extend", cmItems);
	};

	const showEditor = () => {
		window.hollowManager.emit("editor", editorKit());
		window.hollowManager.emit("context-menu", false);
	};

	const showSettings = () => {
		window.hollowManager.emit(
			`${tool.toLowerCase()}-${card}-settings`,
			true,
		);
		window.hollowManager.emit("context-menu", false);
	};

	onCleanup(() => {
		canvas.removeEventListener("mousemove", onMouseMoveInCanvas);
		canvas.removeEventListener("mouseup", onMouseUp);
	});

	onMount(async () => {
		window.toolManager.addEditorKit(editorKit());
		window.toolManager.loadCard(card, tool);
	});
	return (
		<div
			ref={vault}
			class={"absolute box-border p-4 transition-all"}
			style={{
				width: `calc(var(--cw) * ${kit().width})`,
				height: `calc(var(--rh) * ${kit().height})`,
				left: `calc(var(--cw) * ${kit().xyz.x})`,
				top: `calc(var(--rh) * ${kit().xyz.y})`,
				"z-index": dragInfo ? "999" : kit().xyz.z,
				cursor: dragInfo() ? "move" : "default",
				"pointer-events": dragInfo() ? "none" : "auto",
				"font-size": kit().extra?.fontSize ?? "1em",
				padding: kit().extra?.outerMargin ?? "0",
			}}
			oncontextmenu={onContextMenu}
			onPointerDown={onMouseDown}
		>
			<div
				id={`${tool}-${card}`}
				class="border-secondary-20 h-full w-full rounded-lg border-1"
				style={{
					"border-radius": `${kit().corner}px`,
					"border-color": kit().border.c,
					"border-style": "solid",
					"border-width": `${kit().border.n}px`,
					"background-color": `rgba(var(--secondary-rgb), ${kit().opacity})`,
					padding: kit().extra?.innerMargin ?? "0",
				}}
				classList={{
					"backdrop-blur-sm": kit().glass,
				}}
			></div>
		</div>
	);
}
