import Hollow from "@assets/logo.svg";
import {
	Component,
	createMemo,
	For,
	JSX,
	onMount,
	Setter,
	Show,
} from "solid-js";
import { hollow } from "../../../hollow";
import { MyIconFun } from "@components/ui/MyIcon";
import { DynamicIcon } from "@components/ui/DynamicIcon";
import { guide } from "@utils/help";
import { useStore } from "@store";
import { registerHotkeyEvent } from "@managers/Hotkeys";
import { getLayoutPanels, isPanelVisible, selectPanel } from "@managers/layout";

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
	setSettings: Setter<boolean>;
};
export default function SideBar({ setSettings }: SideBarProps) {
	const { state, dispatch } = useStore();
	const alert = createMemo(
		() => state.notifications.notifications.length > 0,
	);
	const anyExtraPanels = createMemo(() => {
		const layout = state.layout;
		return layout.left.panels.length > 2 || layout.right.panels.length > 2;
	});

	const toggleDnd = () => {
		const p = state.context.canvasConfigs;
		dispatch({
			domain: "context",
			type: "set-canvas-configs",
			configs: {
				disableDrag: !p.disableDrag,
				disableResize: !p.disableResize,
			},
		});
	};

	const top: SideBarButton[] = [
		{
			id: "expand-btn",
			Icon: MyIconFun({ name: "home-2-fill" }),
			onClick: () => selectPanel("left", "expand"),
			selectedCondition: () => isPanelVisible("left", "expand"),
		},
		{
			id: "editor-btn",
			Icon: MyIconFun({ name: "designtools-fill" }),
			onClick: () => selectPanel("right", "editor"),
			selectedCondition: () => isPanelVisible("right", "editor"),
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
			selectedCondition: () => state.context.isLiveEditor,
			tooltip: "Edit cards directly in the canvas",
		},
		{
			id: "character-btn",
			Icon: MyIconFun({ name: "user" }),
			onClick: () => selectPanel("left", "character"),
			selectedCondition: () => isPanelVisible("left", "character"),
		},
		{
			id: "notifications-btn",
			Icon: MyIconFun({ name: "bell-fill" }),
			onClick: () => selectPanel("right", "notifications"),
			selectedCondition: () => isPanelVisible("right", "notifications"),
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
		registerHotkeyEvent("Toggle Drag and Drop Mode", toggleDnd);

		if (!localStorage.guide) {
			guide();
			localStorage.guide = "true";
		}
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
			<Show when={anyExtraPanels()}>
				<div class="bg-secondary-10 mx-auto flex flex-col gap-3 rounded-lg p-1">
					<For
						each={[
							...state.layout.left.panels,
							...state.layout.right.panels,
						]}
					>
						{(id) => {
							const btn = getLayoutPanels().extra.find(
								(i) => i.id === id,
							);
							if (!btn) return;
							return (
								<ControlButton
									id={btn.id}
									Icon={btn.icon}
									tooltip={btn.tooltip}
									selectedCondition={() =>
										isPanelVisible(btn.type, btn.id)
									}
									onClick={() =>
										selectPanel(btn.type, btn.id)
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
