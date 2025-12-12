import Hollow from "@assets/logo.svg";
import GearIcon from "@assets/icons/gear.svg";
import BellIcon from "@assets/icons/bell-ringing.svg";
import MosaicIcon from "@assets/icons/mosaic.svg";
import PenRulerIcon from "@assets/icons/pen-ruler.svg";
import PenIcon from "@assets/icons/pen.svg";
import { NotifyManager } from "@managers/NotifyManager";
import { createMemo, For, onMount, Setter, Show } from "solid-js";
import { Accessor, createSignal } from "solid-js";
import VaultIcon from "@assets/icons/vault.svg";
import { hollow } from "hollow";
import { Layout, SideBarButton } from "@type/hollow";
import { Dynamic } from "solid-js/web";
import { ConfigsType } from "solid-kitx";
import { CharacterManager } from "@managers/CharacterManager";

type SideBarProps = {
	layout: Layout;
	setSettings: Setter<boolean>;
	setCanvasConfigs: Setter<ConfigsType>;
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
			Icon: MosaicIcon,
			onClick: () => layout.selectPanel("left", "expand"),
			selectedCondition: () => layout.isPanelVisible("left", "expand"),
		},
		{
			Icon: PenRulerIcon,
			onClick: () => layout.selectPanel("right", "editor"),
			selectedCondition: () => layout.isPanelVisible("right", "editor"),
		},
		{
			Icon: VaultIcon,
			onClick: () => hollow.events.toggle("show-vault"),
		},
	];
	const bottom: SideBarButton[] = [
		{
			Icon: PenIcon,
			onClick: () =>
				setCanvasConfigs((p) => ({
					...p,
					disableNodeDrag: !p.disableNodeDrag,
					disableEdgeDrag: !p.disableEdgeDrag,
					disableVerticalPan: !p.disableVerticalPan,
					disableHorizontalPan: !p.disableHorizontalPan,
				})),
			selectedCondition: isLiveEditor,
			tooltip: "Edit cards directly in the canvas",
		},
		{
			Icon: BellIcon,
			onClick: () => layout.selectPanel("right", "notifications"),
			selectedCondition: () =>
				layout.isPanelVisible("right", "notifications"),
		},
		{
			Icon: GearIcon,
			onClick: () => setSettings((prev) => !prev),
		},
	];
	onMount(() => {
		hollow.events.on("notify-status", setAlert);
	});
	return (
		<div class="bg-secondary-10/0 mr-2 flex w-14 flex-col gap-4 rounded-xl py-4">
			<button onclick={() => layout.selectPanel("left", "character")}>
				<Hollow class="orbit mx-auto size-9" />
			</button>
			<hr class="border-secondary-10 bg-secondary mx-auto h-px w-10 border-t" />
			{/* t	 */}
			<div class="mx-auto flex flex-1 flex-col gap-3">
				<For each={top}>
					{(btn) => (
						<button
							class="button-control"
							classList={{
								"tool-tip": !!btn.tooltip,
								selected:
									btn.selectedCondition &&
									btn.selectedCondition(),
							}}
							onclick={btn.onClick}
						>
							<Show when={btn.tooltip}>
								<span
									data-side="right"
									class="tool-tip-content"
								>
									{btn.tooltip}
								</span>
							</Show>
							<Dynamic
								component={btn.Icon}
								{...{ class: "ma-auto size-5" }}
							/>
						</button>
					)}
				</For>
			</div>

			{/* bottom */}
			<div class="z-1 mx-auto flex flex-col gap-2">
				<For each={bottom}>
					{(btn) => (
						<button
							class="button-control"
							classList={{
								"tool-tip": !!btn.tooltip,
								selected:
									btn.selectedCondition &&
									btn.selectedCondition(),
							}}
							onclick={btn.onClick}
						>
							<Show when={btn.tooltip}>
								<span
									data-side="right"
									class="tool-tip-content"
								>
									{btn.tooltip}
								</span>
							</Show>
							<Dynamic
								component={btn.Icon}
								{...{ class: "ma-auto size-5" }}
							/>
						</button>
					)}
				</For>
			</div>
		</div>
	);
}
