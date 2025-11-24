import { NotifyType } from "@type/hollow";
import BellIcon from "@assets/icons/bell.svg";
import { Accessor, lazy, Suspense } from "solid-js";
import { createSignal, For, Setter, Show } from "solid-js";
import {
	ChevronDownIcon,
	SquareArrowOutUpRightIcon,
	XIcon,
} from "lucide-solid";
import { Motion, Presence } from "solid-motionone";
import { NotifyManager } from "@managers/NotifyManager";
import PopupWrapper from "./PopupWrapper";
const Icon = lazy(() => import("@components/Icon"));

type NotificationsProps = {
	isVisible: Accessor<boolean>;
	setVisible: Setter<boolean>;
};

export default function Notifications({
	isVisible,
	setVisible,
}: NotificationsProps) {
	return (
		<div class="pointer-events-none fixed top-5 right-5 bottom-5 z-10 h-full w-120 max-w-full">
			<Presence>
				<Show when={isVisible()}>
					<Motion.div
						initial={{
							x: "100%",
						}}
						animate={{ x: "0%" }}
						exit={{ x: "100%" }}
						transition={{ duration: 0.4 }}
						class="h-full w-full"
					>
						<NotifyList setVisible={setVisible} />
					</Motion.div>
				</Show>
			</Presence>
		</div>
	);
}

type NotifyListProps = {
	setVisible: Setter<boolean>;
};
function NotifyList({ setVisible }: NotifyListProps) {
	const [notifications, setNotifications] = createSignal(
		NotifyManager.getSelf().getNotification(),
	);
	// TODO if list is seen then no alert
	const removeNoty = (id: string) => {
		setNotifications((prev) => [...prev.filter((i) => i.id !== id)]);
		NotifyManager.getSelf().removeNoty(id);
	};
	const clearAll = () => {
		setVisible(false);
		setNotifications([]);
		NotifyManager.getSelf().clearAll();
	};
	const getIconFromType = (type: string): { icon: string; color: string } => {
		switch (type) {
			case "achievement":
				return { icon: "Trophy", color: "#FFD700" };
			case "reminder":
				return { icon: "Bell", color: "#5A67D8" };
			case "error":
				return { icon: "OctagonX", color: "#E53E3E" };
			case "warning":
				return {
					icon: "OctagonAlert",
					color: "#D69E2E",
				};
			case "update":
				return { icon: "Rocket", color: "#38A169" };
			default:
				return { icon: "Megaphone", color: "#718096" };
		}
	};

	return (
		<PopupWrapper
			Icon={BellIcon}
			title="Notifications"
			onClose={() => setVisible(false)}
			shadow={false}
		>
			<div class="flex h-[calc(100vh-calc(var(--spacing)*24))] w-120 flex-col gap-3 px-3">
				<div class="flex items-center justify-between">
					<p class="text-secondary-40 px-3 text-sm tracking-wider">
						Notifications
					</p>
					<Show when={notifications().length > 0}>
						<div class="flex w-full p-2">
							<button
								onclick={clearAll}
								class="button-secondary ml-auto"
							>
								Clear All
							</button>
						</div>
					</Show>
				</div>
				<hr class="border-secondary bg-secondary-10 h-[2px] w-full" />
				<div class="flex max-h-full flex-1 flex-col gap-3 overflow-hidden overflow-y-scroll">
					<For each={notifications()}>
						{(noti) => {
							const tp = getIconFromType(noti.type);
							return (
								<Noty
									noti={noti}
									tp={tp}
									removeNoty={removeNoty}
								/>
							);
						}}
					</For>
					<Show when={notifications().length === 0}>
						<span class="text-secondary-50 m-auto text-center tracking-tighter">
							You have no notifications
						</span>
					</Show>
				</div>
			</div>
		</PopupWrapper>
	);
}

function Noty({
	noti,
	tp,
	external,
	removeNoty,
}: {
	noti: NotifyType;
	tp: { color: string; icon: string };
	external?: boolean;
	removeNoty?: (id: string) => void;
}) {
	const [expand, setExpand] = createSignal(false);
	return (
		<div
			class="bg-secondary-05 pointer-events-auto h-fit w-full rounded-xl border p-2"
			classList={{
				"border-secondary-10": external,
				"border-secondary-15/60": !external,
			}}
		>
			<div
				class="flex items-center gap-4"
				style={{
					color: tp.color,
				}}
			>
				<Suspense>
					<Icon
						class="size-10 shrink-0 rounded-lg p-2.5"
						classList={{
							"bg-secondary-10": external,
							"bg-secondary-15/60": !external,
						}}
						name={tp.icon}
					/>
				</Suspense>
				<Show
					when={noti.attachment}
					fallback={<h1 class="truncate font-bold">{noti.title}</h1>}
				>
					<a
						class="flex min-w-0 flex-1 items-center gap-2"
						href={noti.attachment}
						target="_blank"
					>
						<h1 class="truncate font-bold">{noti.title}</h1>
						<Show when={noti.attachment}>
							<SquareArrowOutUpRightIcon class="size-4" />
						</Show>
					</a>
				</Show>
				<div class="ml-auto">
					<Show when={!external}>
						<button
							class="button-control"
							onclick={() => removeNoty(noti.id)}
						>
							<XIcon class="text-secondary-40" />
						</button>
					</Show>
					<button
						class="button-control"
						onclick={() => setExpand((prev) => !prev)}
					>
						<ChevronDownIcon
							class="text-secondary-40"
							classList={{
								"rotate-180": expand(),
							}}
						/>
					</button>
				</div>
			</div>
			<Show when={expand()}>
				<div class="h-fit w-full px-1 pt-3 pb-1 text-neutral-400 dark:text-neutral-600">
					<p>{noti.message}</p>
				</div>
			</Show>
		</div>
	);
}
