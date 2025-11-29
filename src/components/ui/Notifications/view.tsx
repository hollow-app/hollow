import { NotificationsProps } from ".";
import BellIcon from "@assets/icons/bell.svg";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import { createSignal, For, lazy, Show, Suspense } from "solid-js";
import PopupWrapper from "../PopupWrapper";
import {
	ChevronDownIcon,
	SquareArrowOutUpRightIcon,
	XIcon,
} from "lucide-solid";

const Icon = lazy(() => import("@components/Icon"));

export const NotificationsView = (
	state: StateType,
	logic: LogicType,
	props: NotificationsProps,
	helper?: HelperType,
) => {
	return (
		<div class="pointer-events-none h-full w-full py-10">
			<div class="flex h-[calc(100vh-calc(var(--spacing)*24))] w-120 flex-col gap-3 px-3">
				<div class="flex items-center justify-between">
					<p class="text-secondary-40 px-3 text-sm tracking-wider">
						Notifications
					</p>
					<Show when={state.notifications().length > 0}>
						<div class="flex w-full p-2">
							<button
								onclick={logic.clearAll}
								class="button-secondary ml-auto"
							>
								Clear All
							</button>
						</div>
					</Show>
				</div>
				<hr class="border-secondary bg-secondary-10 h-[2px] w-full" />
				<div class="flex max-h-full flex-1 flex-col gap-3 overflow-hidden overflow-y-scroll">
					<For each={state.notifications()}>
						{(noti) => {
							const tp = logic.getIconFromType(noti.type);
							const [expand, setExpand] = createSignal(false);
							return (
								<div class="bg-secondary-05 border-secondary-15/60 pointer-events-auto h-fit w-full rounded-xl border p-2">
									<div
										class="flex items-center gap-4"
										style={{
											color: tp.color,
										}}
									>
										<Suspense>
											<Icon
												class="bg-secondary-15/60 size-10 shrink-0 rounded-lg p-2.5"
												name={tp.icon}
											/>
										</Suspense>
										<Show
											when={noti.attachment}
											fallback={
												<h1 class="truncate font-bold">
													{noti.title}
												</h1>
											}
										>
											<a
												class="flex min-w-0 flex-1 items-center gap-2"
												href={noti.attachment}
												target="_blank"
											>
												<h1 class="truncate font-bold">
													{noti.title}
												</h1>
												<Show when={noti.attachment}>
													<SquareArrowOutUpRightIcon class="size-4" />
												</Show>
											</a>
										</Show>
										<div class="ml-auto">
											<button
												class="button-control"
												onclick={() =>
													logic.removeNoty(noti.id)
												}
											>
												<XIcon class="text-secondary-40" />
											</button>
											<button
												class="button-control"
												onclick={() =>
													setExpand((prev) => !prev)
												}
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
						}}
					</For>
					<Show when={state.notifications().length === 0}>
						<span class="text-secondary-50 m-auto text-center tracking-tighter">
							You have no notifications
						</span>
					</Show>
				</div>
			</div>
		</div>
	);
};
