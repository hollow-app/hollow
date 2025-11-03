import { CardType, ContextMenuItem } from "@type/hollow";
import { EditorKitType } from "@type/EditorKitType";
import { KitType } from "@type/hollow";
import {
	createMemo,
	createResource,
	createSignal,
	onCleanup,
	onMount,
} from "solid-js";
import { Opthand } from "@type/Opthand";
import { hollow } from "hollow";
import { loadEnvFile } from "process";

type CardProps = {
	cardInfo: Opthand;
	canvas: HTMLDivElement;
};

export default function Card({ cardInfo, canvas }: CardProps) {
	let vault!: HTMLDivElement;
	const [kit, setKit] = createSignal<KitType>(cardInfo.kit);
	const [isLoaded, setLoaded] = createSignal(false);
	const editorKit = createMemo<EditorKitType>(() => ({
		tool: cardInfo.tool,
		card: cardInfo.name,
		it: cardInfo.kit,
		setIt: setKit,
		save: () =>
			hollow.toolManager.changeKit(kit(), cardInfo.name, cardInfo.tool),
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
			hollow.toolManager.changeKit(kit(), cardInfo.name, cardInfo.tool);
		}
	};

	const onMouseMoveInCanvas = (e: MouseEvent) => {
		const { left, top } = canvas.getBoundingClientRect();
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

	const showEditor = () => {
		hollow.events.emit("editor", editorKit());
		hollow.events.emit("context-menu", false);
	};

	const showSettings = () => {
		hollow.events.emit(
			`${cardInfo.tool.toLowerCase()}-${cardInfo.name}-settings`,
			true,
		);
		hollow.events.emit("context-menu", false);
	};

	onCleanup(() => {
		canvas.removeEventListener("mousemove", onMouseMoveInCanvas);
		canvas.removeEventListener("mouseup", onMouseUp);
	});
	onMount(async () => {
		hollow.toolManager.addEditorKit(editorKit());
		setLoaded(await hollow.toolManager.loadCard(cardInfo, cardInfo.tool));
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
				padding: kit().extra?.outerMargin ?? "0",
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
				}}
				//onAnimationEnd={(e) =>
				//	e.currentTarget.classList.remove("card-spot")
				//}
				classList={{
					"backdrop-blur-sm": kit().glass,
					"card-spot": !isLoaded(),
				}}
			></div>
		</div>
	);
}
