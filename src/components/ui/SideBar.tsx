import Hollow from "@assets/logo.svg";
import { manager } from "@managers/index";
import {
	Component,
	For,
	JSX,
	onCleanup,
	onMount,
	Setter,
	Show,
} from "solid-js";
import { Accessor, createSignal } from "solid-js";
import { hollow } from "hollow";
import { MyIconFun } from "@components/MyIcon";
import { GridStackOptions } from "gridstack";
import { Layout } from "@utils/layout";
import { DynamicIcon } from "@components/DynamicIcon";
import { guide } from "@utils/help";
import { useHollow } from "../../HollowContext";

interface SideBarButton {
	id: string;
	Icon: Component;
	onClick: () => void;
	tooltip?: string;
	selectedCondition?: () => boolean;
	style?: JSX.CSSProperties;
	class?: string;
}

type SideBarProps = {
	layout: Layout;
	setSettings: Setter<boolean>;
};
export default function SideBar({ layout, setSettings }: SideBarProps) {
	const { isLiveEditor, setCanvasConfigs } = useHollow();
	const [alert, setAlert] = createSignal(false);

	const toggleDnd = () => {
		setCanvasConfigs((p) => ({
			...p,
			disableDrag: !p.disableDrag,
			disableResize: !p.disableResize,
		}));
	};

	const top: SideBarButton[] = [
		{
			id: "expand-btn",
			Icon: MyIconFun({ name: "home-2-fill" }),
			onClick: () => layout.selectPanel("left", "expand"),
			selectedCondition: () => layout.isPanelVisible("left", "expand"),
		},
		{
			id: "editor-btn",
			Icon: MyIconFun({ name: "designtools-fill" }),
			onClick: () => layout.selectPanel("right", "editor"),
			selectedCondition: () => layout.isPanelVisible("right", "editor"),
		},
		{
			id: "vault-btn",
			Icon: MyIconFun({ name: "strongbox-fill" }),
			onClick: () => hollow.events.toggle("show-vault"),
		},
	];
	const bottom: SideBarButton[] = [
		{
			id: "canvas-editor-btn",
			Icon: MyIconFun({ name: "pen-tool-fill" }),
			onClick: toggleDnd,
			selectedCondition: isLiveEditor,
			tooltip: "Edit cards directly in the canvas",
		},
		{
			id: "character-btn",
			Icon: MyIconFun({ name: "user" }),
			onClick: () => layout.selectPanel("left", "character"),
			selectedCondition: () => layout.isPanelVisible("left", "character"),
		},
		{
			id: "notifications-btn",
			Icon: MyIconFun({ name: "bell-fill" }),
			onClick: () => layout.selectPanel("right", "notifications"),
			selectedCondition: () =>
				layout.isPanelVisible("right", "notifications"),
			style: {
				"--opacity": "var(--alert)",
			},
		},
		{
			id: "settings-btn",
			Icon: MyIconFun({ name: "gear-fill" }),
			onClick: () => setSettings((prev) => !prev),
		},
	];
	onMount(() => {
		manager.hotkeys.events["Toggle Drag and Drop Mode"] = toggleDnd;
		const unsub = manager.notify.subscribe(
			(a) => {
				setAlert(a);
			},
			{ key: "alert", now: true },
		);
		if (!localStorage.guide) {
			guide();
			localStorage.guide = "true";
		}
		onCleanup(() => {
			unsub();
		});
	});

	return (
		<div
			id="sidebar"
			class="border-secondary-10 my-2 mr-2 box-content flex w-13 shrink-0 flex-col gap-4 rounded-xl border-r-0 bg-[var(--front)] py-2"
			style={{
				"--alert": alert() ? "0.9" : "0.5",
			}}
		>
			<button class="outline-none">
				<Hollow class="orbit mx-auto size-8" />
			</button>
			<div class="mx-auto flex flex-col gap-3">
				<For each={top}>{(btn) => <ControlButton {...btn} />}</For>
			</div>
			<Show when={layout.anyExtraPanels()}>
				<div class="bg-secondary-10 mx-auto flex flex-col gap-3 rounded-lg p-1">
					<For
						each={[
							...layout.get.left.panels,
							...layout.get.right.panels,
						]}
					>
						{(id) => {
							const btn = layout.panels.extra.find(
								(i) => i.id === id,
							);
							if (!btn) return;
							return (
								<ControlButton
									id={btn.id}
									Icon={btn.icon}
									tooltip={btn.tooltip}
									selectedCondition={() =>
										layout.isPanelVisible(btn.type, btn.id)
									}
									onClick={() =>
										layout.selectPanel(btn.type, btn.id)
									}
								/>
							);
						}}
					</For>
				</div>
			</Show>
			{/* bottom */}
			<div class="z-1 mx-auto mt-auto flex flex-col gap-2">
				<For each={bottom}>{(btn) => <ControlButton {...btn} />}</For>
			</div>
		</div>
	);
}

const ControlButton = (btn: SideBarButton) => {
	return (
		<div
			classList={{
				"tool-tip": !!btn.tooltip,
			}}
		>
			<Show when={btn.tooltip}>
				<span data-side="right" class="tool-tip-content">
					{btn.tooltip}
				</span>
			</Show>
			<button
				id={btn.id}
				class={"button-control " + (btn.class ?? "")}
				style={{
					"--size": "calc(var(--spacing) * 8)",
					...(btn.style ?? {}),
				}}
				classList={{
					selected: btn.selectedCondition && btn.selectedCondition(),
				}}
				onclick={btn.onClick}
			>
				<DynamicIcon icon={btn.Icon} class="m-auto size-4.5" />
			</button>
		</div>
	);
};
