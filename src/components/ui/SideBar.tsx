import Hollow from "@assets/logo.svg";
import BellIcon from "@assets/icons/strongbox-outline.svg";
import { NotifyManager } from "@managers/NotifyManager";
import { Component, createMemo, For, onMount, Setter, Show } from "solid-js";
import { Accessor, createSignal } from "solid-js";
import { hollow } from "hollow";
import { Layout, SideBarButton } from "@type/hollow";
import { Dynamic } from "solid-js/web";
import MyIcon, { MyIconFun } from "@components/MyIcon";
import {
	ArchiveIcon,
	LayoutGridIcon,
	PencilRulerIcon,
	ToolCaseIcon,
	VaultIcon,
} from "lucide-solid";
import { GridStackOptions } from "gridstack";

type SideBarProps = {
	layout: Layout;
	setSettings: Setter<boolean>;
	setCanvasConfigs: Setter<GridStackOptions>;
	isLiveEditor: Accessor<boolean>;
};
export default function SideBar({
	layout,
	setSettings,
	setCanvasConfigs,
	isLiveEditor,
}: SideBarProps) {
	const [alert, setAlert] = createSignal(NotifyManager.getSelf().isAlert());

	const top: SideBarButton[] = [
		{
			Icon: MyIconFun({ name: "home-outline" }),
			onClick: () => layout.selectPanel("left", "expand"),
			selectedCondition: () => layout.isPanelVisible("left", "expand"),
		},
		{
			Icon: MyIconFun({ name: "designtools-outline" }),
			onClick: () => layout.selectPanel("right", "editor"),
			selectedCondition: () => layout.isPanelVisible("right", "editor"),
		},
		{
			Icon: MyIconFun({ name: "strongbox-outline" }),
			onClick: () => hollow.events.toggle("show-vault"),
		},
	];
	const bottom: SideBarButton[] = [
		{
			Icon: MyIconFun({ name: "pen-outline" }),
			onClick: () =>
				setCanvasConfigs((p) => ({
					...p,
					disableDrag: !p.disableDrag,
					disableResize: !p.disableResize,
				})),
			selectedCondition: isLiveEditor,
			tooltip: "Edit cards directly in the canvas",
		},
		{
			Icon: MyIconFun({ name: "bell-outline" }),
			onClick: () => layout.selectPanel("right", "notifications"),
			selectedCondition: () =>
				layout.isPanelVisible("right", "notifications"),
		},
		{
			Icon: MyIconFun({ name: "gear-outline" }),
			onClick: () => setSettings((prev) => !prev),
		},
	];
	onMount(() => {
		hollow.events.on("notify-status", setAlert);
	});
	return (
		<div class="bg-secondary-10/0 mr-2 flex w-fit flex-col gap-4 rounded-xl py-4">
			<button onclick={() => layout.selectPanel("left", "character")}>
				<Hollow class="orbit mx-auto size-9" />
			</button>
			{/* <hr class="border-secondary-10 bg-secondary mx-auto h-px w-10 border-t" /> */}
			{/* t	 */}
			<div class="mx-auto flex flex-1 flex-col gap-3">
				<For each={top}>{(btn) => <ControlButton {...btn} />}</For>
			</div>

			{/* bottom */}
			<div class="z-1 mx-auto flex flex-col gap-2">
				<For each={bottom}>{(btn) => <ControlButton {...btn} />}</For>
			</div>
		</div>
	);
}

const ControlButton = (btn: SideBarButton) => {
	return (
		<button
			class="button-control"
			classList={{
				"tool-tip": !!btn.tooltip,
				selected: btn.selectedCondition && btn.selectedCondition(),
			}}
			onclick={btn.onClick}
		>
			<Show when={btn.tooltip}>
				<span data-side="right" class="tool-tip-content">
					{btn.tooltip}
				</span>
			</Show>
			<Dynamic component={btn.Icon} {...{ class: "m-auto size-5" }} />
		</button>
	);
};
