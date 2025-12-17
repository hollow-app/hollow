import Hollow from "@assets/logo.svg";
import BellIcon from "@assets/icons/strongbox-outline.svg";
import { NotifyManager } from "@managers/NotifyManager";
import { Component, createMemo, For, onMount, Setter, Show } from "solid-js";
import { Accessor, createSignal } from "solid-js";
import { hollow } from "hollow";
import { Dynamic } from "solid-js/web";
import MyIcon, { MyIconFun } from "@components/MyIcon";
import { GridStackOptions } from "gridstack";
import { Layout } from "@utils/layout";

interface SideBarButton {
	Icon: Component;
	onClick: () => void;
	tooltip?: string;
	selectedCondition?: () => boolean;
}

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
			Icon: MyIconFun({ name: "home-2-fill" }),
			onClick: () => layout.selectPanel("left", "expand"),
			selectedCondition: () => layout.isPanelVisible("left", "expand"),
		},
		{
			Icon: MyIconFun({ name: "designtools-fill" }),
			onClick: () => layout.selectPanel("right", "editor"),
			selectedCondition: () => layout.isPanelVisible("right", "editor"),
		},
		{
			Icon: MyIconFun({ name: "strongbox-fill" }),
			onClick: () => hollow.events.toggle("show-vault"),
		},
	];
	const bottom: SideBarButton[] = [
		{
			Icon: MyIconFun({ name: "pen-tool-fill" }),
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
			Icon: MyIconFun({ name: "bell-fill" }),
			onClick: () => layout.selectPanel("right", "notifications"),
			selectedCondition: () =>
				layout.isPanelVisible("right", "notifications"),
		},
		{
			Icon: MyIconFun({ name: "gear-fill" }),
			onClick: () => setSettings((prev) => !prev),
		},
	];
	onMount(() => {
		hollow.events.on("notify-status", setAlert);
	});

	return (
		<div class="border-secondary-10 bg-secondary-05 my-2 mr-2 box-content flex w-13 shrink-0 flex-col gap-4 rounded-xl border-r-0 py-2">
			<button onclick={() => layout.selectPanel("left", "character")}>
				<Hollow class="orbit mx-auto size-8" />
			</button>
			<div class="mx-auto flex flex-col gap-3">
				<For each={top}>{(btn) => <ControlButton {...btn} />}</For>
			</div>
			<Show when={layout.anyExtraPanels()}>
				<div class="bg-secondary-10 mx-auto flex flex-col gap-3 rounded p-1">
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
				class="button-control"
				style={{ "--size": "calc(var(--spacing) * 8)" }}
				classList={{
					selected: btn.selectedCondition && btn.selectedCondition(),
				}}
				onclick={btn.onClick}
			>
				<Dynamic
					component={btn.Icon}
					{...{ class: "m-auto size-4.5" }}
				/>
			</button>
		</div>
	);
};
