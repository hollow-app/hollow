import Hollow from "@assets/logo.svg";
import GearIcon from "@assets/icons/gear.svg";
import BellIcon from "@assets/icons/bell-ringing.svg";
import MosaicIcon from "@assets/icons/mosaic.svg";
import PenRulerIcon from "@assets/icons/pen-ruler.svg";
import ChartPieIcon from "@assets/icons/chart-pie.svg";
import { NotifyManager } from "@managers/NotifyManager";
import { Move } from "lucide-solid";
import { createMemo, onMount, Setter } from "solid-js";
import { Accessor, createSignal } from "solid-js";
import VaultIcon from "@assets/icons/vault.svg";
import { hollow } from "hollow";
import { Layout } from "@type/hollow";

type SideBarProps = {
	layout: Layout;
	setSettings: Setter<boolean>;
	isDrag: Accessor<boolean>;
	setDrag: Setter<boolean>;
};
export default function SideBar({
	layout,
	setDrag,
	isDrag,
	setSettings,
}: SideBarProps) {
	const toggleDragAndDrop = () => {
		document.getElementById("root").classList.toggle("dnd-mode");
		setDrag(!isDrag());
	};

	const [alert, setAlert] = createSignal(NotifyManager.getSelf().isAlert());

	onMount(() => {
		hollow.events.on("notify-status", setAlert);
	});
	return (
		<div class="bg-secondary-10/0 mr-2 flex w-14 flex-col gap-4 rounded-xl py-4">
			<button
				//class="bg-secondary-05 border-secondary-10 hover:text-secondary-95 text-secondary-80 mx-auto w-fit rounded-lg border p-1"
				onclick={() => layout.selectPanel("left", "character")}
			>
				<Hollow class="orbit mx-auto size-9" />
			</button>
			<hr class="border-secondary-10 bg-secondary mx-auto h-px w-10 border-t" />
			<div class="mx-auto flex flex-1 flex-col gap-3">
				<button
					class="button-control"
					classList={{
						selected: layout.isPanelVisible("left", "expand"),
					}}
					onclick={() => layout.selectPanel("left", "expand")}
				>
					<MosaicIcon class="m-auto size-5" />
				</button>
				<button
					class="button-control"
					onclick={() => hollow.events.toggle("show-entries")}
				>
					<ChartPieIcon class="size-5" />
				</button>
				<button
					class="button-control"
					classList={{
						selected: layout.isPanelVisible("right", "editor"),
					}}
					onclick={() => layout.selectPanel("right", "editor")}
				>
					<PenRulerIcon class="size-5" />
				</button>
			</div>
			<div class="mx-auto flex flex-col gap-2">
				<button
					class={"button-control tool-tip"}
					classList={{
						selected: isDrag(),
					}}
					onclick={toggleDragAndDrop}
				>
					<span data-side="right" class="tool-tip-content">
						Turn on drag-drop for cards
					</span>
					<Move class="m-auto size-5" />
				</button>
				<button
					class="button-control"
					onclick={() => hollow.events.toggle("show-vault")}
				>
					<VaultIcon class="size-5" />
				</button>

				<button
					class="button-control"
					classList={{
						selected: layout.isPanelVisible(
							"right",
							"notifications",
						),
					}}
					onclick={() => layout.selectPanel("right", "notifications")}
				>
					<BellIcon
						class="size-5"
						style={{
							"--opacity": alert() ? "0.5" : "0",
						}}
					/>
				</button>
				<button
					class="button-control"
					onclick={() => setSettings((prev) => !prev)}
				>
					<GearIcon class="size-5" />
				</button>
			</div>
		</div>
	);
}
