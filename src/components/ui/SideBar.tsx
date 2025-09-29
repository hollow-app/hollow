import Hollow from "@assets/icon-nobg.svg";
import { NotifyManager } from "@managers/NotifyManager";
import { ToolCaseIcon, Vault } from "lucide-solid";
import { onMount, Setter } from "solid-js";
import { Accessor, createSignal } from "solid-js";
import { Settings, Layers, BellNotification, Move } from "@coolicons-dev/solid";
type SideBarProps = {
	toggleChara: () => void;
	isExpand: Accessor<boolean>;
	toggleExpand: () => void;
	setSettings: Setter<boolean>;
	isDrag: Accessor<boolean>;
	setDrag: Setter<boolean>;
	setNotifications: Setter<boolean>;
};
export default function SideBar({
	isExpand,
	setDrag,
	isDrag,
	setSettings,
	toggleChara,
	toggleExpand,
	setNotifications,
}: SideBarProps) {
	const toggleDragAndDrop = () => {
		document.getElementById("root").classList.toggle("dnd-mode");
		setDrag(!isDrag());
	};

	const [alert, setAlert] = createSignal(
		NotifyManager.getSelf().system.notifications.length > 0,
	);

	onMount(() => {
		window.hollowManager.on("notify-status", setAlert);
	});
	return (
		<div class="w-14 mr-2 bg-secondary-10/0 gap-4 flex flex-col rounded-xl py-4">
			<button class="" onclick={() => toggleChara()}>
				<Hollow class="size-8 mx-auto hollow-effect" />
			</button>
			<hr class="w-10 h-px border-t border-secondary-10 mx-auto bg-secondary " />
			<div class="flex-1 mx-auto flex flex-col gap-3">
				<button
					class="button-control"
					classList={{ selected: isExpand() }}
					onclick={() => toggleExpand()}
				>
					<ToolCaseIcon class="size-5 m-auto" />
				</button>
				<button
					class="button-control"
					onclick={() => window.hollowManager.emit("show-vault")}
				>
					<Vault class="size-5" />
				</button>
				<button
					class="button-control"
					onclick={() => window.hollowManager.emit("show-entries")}
				>
					<Layers class="size-5" />
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
					onclick={() => setNotifications((prev) => !prev)}
				>
					<BellNotification
						class="notify-status-bell size-5 "
						classList={{ "fill-primary": alert() }}
					/>
				</button>
				<button
					class="button-control"
					onclick={() => setSettings((prev) => !prev)}
				>
					<Settings class="size-5" />
				</button>
			</div>
		</div>
	);
}
