import { NotificationsProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import { createSignal, For, lazy, Show, Suspense } from "solid-js";
import {
	ChevronDownIcon,
	SquareArrowOutUpRightIcon,
	XIcon,
} from "lucide-solid";
import MyIcon from "@components/MyIcon";

export const NotificationsView = (
	state: StateType,
	logic: LogicType,
	props: NotificationsProps,
	helper?: HelperType,
) => {
	return (
		<div class="w-ful box-border flex h-full flex-col gap-3 px-3 py-5">
			<div class="border-secondary-10 flex items-center justify-between border-b pb-4">
				<div class="space-y-1">
					<h2 class="text-lg font-semibold tracking-tight">
						Notifications
					</h2>
					<p class="text-sm text-neutral-500">
						View and manage your notifications.
					</p>
				</div>
				<Show when={state.notifications().length > 0}>
					<button
						onclick={logic.clearAll}
						class="button-control"
						title="Clear All"
					>
						<MyIcon name="broom-outline" class="size-5" />
					</button>
				</Show>
			</div>
			<div class="flex max-h-full flex-1 flex-col gap-3 overflow-hidden overflow-y-scroll">
				<Show
					when={state.notifications().length !== 0}
					fallback={
						<span class="text-secondary-50 m-auto text-center tracking-tighter">
							You have no notifications
						</span>
					}
				>
					<For each={state.notifications()}>
						{(noti) => {
							const [expand, setExpand] = createSignal(false);

							return (
								<div class="border-secondary-15/60 bg-secondary-05 pointer-events-auto w-full rounded-xl border px-3 py-2.5 transition">
									<Show when={noti.banner}>
										<div class="border-secondary-15 bg-secondary-10 mb-2 overflow-hidden rounded-lg border">
											<img
												src={noti.banner}
												class="h-24 w-full object-cover transition"
												loading="lazy"
											/>
										</div>
									</Show>

									{/* Header */}
									<div class="flex items-center gap-3">
										<div class="min-w-0 flex-1">
											<Show
												when={noti.attachment}
												fallback={
													<h1 class="text-secondary-90 truncate text-sm font-semibold">
														{noti.title}
													</h1>
												}
											>
												<a
													href={noti.attachment}
													target="_blank"
													class="text-secondary-90 hover:text-secondary-100 flex min-w-0 items-center gap-2 text-sm font-semibold outline-none"
												>
													<span class="truncate">
														{noti.title}
													</span>
													<SquareArrowOutUpRightIcon class="size-3.5 opacity-60" />
												</a>
											</Show>

											{/* Small timestamp line (optional) */}
											<p class="text-secondary-40 mt-0.5 text-[11px]">
												{new Date(
													noti.submitted_at,
												).toLocaleDateString()}
											</p>
										</div>

										{/* Controls */}
										<div class="flex items-center gap-1">
											<button
												class="text-secondary-40 hover:bg-secondary-10 hover:text-secondary-80 rounded-md p-1.5"
												onclick={() =>
													logic.removeNoty(noti.id)
												}
											>
												<XIcon class="size-4" />
											</button>

											<button
												class="text-secondary-40 hover:bg-secondary-10 hover:text-secondary-80 rounded-md p-1.5 transition"
												onclick={() =>
													setExpand((v) => !v)
												}
											>
												<ChevronDownIcon
													class="size-4 transition-transform"
													classList={{
														"rotate-180": expand(),
													}}
												/>
											</button>
										</div>
									</div>

									{/* Body */}
									<Show when={expand()}>
										<div class="border-secondary-10 text-secondary-60 mt-2 border-t pt-2 text-sm">
											<p class="leading-relaxed">
												{noti.message}
											</p>
										</div>
									</Show>
								</div>
							);
						}}
					</For>
				</Show>
			</div>
		</div>
	);
};
