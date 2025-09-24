import { NotifyManager } from "@managers/NotifyManager";
import {
	BellDotIcon,
	BellIcon,
	BookTextIcon,
	PanelRightClose,
	ReplaceIcon,
	SettingsIcon,
} from "lucide-solid";
import { Accessor, createSignal, onMount, Setter, Show } from "solid-js";
import WindowControl from "./WindowControl";

type NavbarProps = {
	setExpand: Setter<boolean>;
	setSettings: Setter<boolean>;
	isDrag: Accessor<boolean>;
	setDrag: Setter<boolean>;
	setNotifications: Setter<boolean>;
};

export default function Navbar({
	setExpand,
	setSettings,
	isDrag,
	setDrag,
	setNotifications,
}: NavbarProps) {
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
		<nav class="flex h-12 titlebar w-full">
			<div
				class="flex h-full w-full items-center justify-between"
				style={{
					"padding-inline": "calc(var(--spacing) * 4.5)",
				}}
			>
				<div class="flex items-center gap-2 ml-auto">
					<button
						class={"button-control"}
						classList={{
							active: isDrag(),
						}}
						onclick={toggleDragAndDrop}
					>
						<ReplaceIcon class="m-auto h-[18px] w-[18px]" />
					</button>
					<button
						class="button-control"
						onclick={() =>
							window.hollowManager.emit("show-entries")
						}
					>
						<BookTextIcon />
					</button>
					{/* <button
                                                class="button-control"
                                                onclick={() => {
                                                        const n: NotifyType = {
                                                                id: "kjl",
                                                                title: "test",
                                                                message: "test",
                                                                type: "error",
                                                                submitted_at:
                                                                        "2025-23-07T12:01:00Z",
                                                                expires_at: "2026-23-07T12:01:00Z",
                                                        };
                                                        window.hollowManager.emit(
                                                                "Notify",
                                                                n,
                                                        );
                                                }}
                                        >
                                                <OrbitIcon />
                                        </button>
					*/}
					<button
						class="button-control"
						onclick={() => setNotifications((prev) => !prev)}
					>
						<Show when={alert()} fallback={<BellIcon />}>
							<BellDotIcon class="notify-status-bell" />
						</Show>
					</button>
					<button
						class="button-control"
						onclick={() => setSettings((b) => !b)}
					>
						<SettingsIcon />
					</button>
					<WindowControl />
				</div>
			</div>
		</nav>
	);
}
