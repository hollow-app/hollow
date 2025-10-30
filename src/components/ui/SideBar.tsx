import Hollow from "@assets/logo.svg";
import GearIcon from "@assets/icons/gear.svg";
import BellIcon from "@assets/icons/bell.svg";
import ToolCaseIcon from "@assets/icons/tool-case.svg";
import PenRulerIcon from "@assets/icons/pen-ruler.svg";
import ServerIcon from "@assets/icons/server.svg";
import { NotifyManager } from "@managers/NotifyManager";
import { Move } from "lucide-solid";
import { onMount, Setter } from "solid-js";
import { Accessor, createSignal } from "solid-js";
import VaultIcon from "@assets/icons/vault.svg";
import { hollow } from "hollow";

type SideBarProps = {
	toggleChara: () => void;
	isExpand: Accessor<boolean>;
	isEditor: Accessor<boolean>;
	toggleExpand: () => void;
	toggleEditor: () => void;
	setSettings: Setter<boolean>;
	isDrag: Accessor<boolean>;
	setDrag: Setter<boolean>;
	setNotifications: Setter<boolean>;
};
export default function SideBar({
	isExpand,
	isEditor,
	setDrag,
	isDrag,
	setSettings,
	toggleChara,
	toggleExpand,
	toggleEditor,
	setNotifications,
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
				class="bg-secondary-05 border-secondary-10 hover:text-secondary-95 text-secondary-80 mx-auto w-fit rounded-lg border p-1"
				onclick={() => toggleChara()}
			>
				<Hollow class="orbit mx-auto size-7" />
			</button>
			<hr class="border-secondary-10 bg-secondary mx-auto h-px w-10 border-t" />
			<div class="mx-auto flex flex-1 flex-col gap-3">
				<button
					class="button-control"
					classList={{ selected: isExpand() }}
					onclick={toggleExpand}
				>
					<ToolCaseIcon class="m-auto size-5" />
				</button>
				<button
					class="button-control"
					onclick={() => hollow.events.toggle("show-entries")}
				>
					<ServerIcon class="size-5" />
				</button>
				<button
					class="button-control"
					classList={{ selected: isEditor() }}
					onclick={toggleEditor}
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
					onclick={() => setNotifications((prev) => !prev)}
				>
					<BellIcon
						class="notify-status-bell size-5"
						style={{
							"--fill": alert()
								? "var(--color-primary)"
								: "currentColor",
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
