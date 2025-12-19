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
			<div class="flex items-center justify-between">
				<p class="text-secondary-40 px-3 text-sm tracking-wider">
					Notifications
				</p>
				<Show when={state.notifications().length > 0}>
					<button
						onclick={logic.clearAll}
						class="button-control"
						title="Clear All"
					>
						<MyIcon name="broom-outline" class="ml-auto size-5" />
					</button>
				</Show>
			</div>
			<hr class="border-secondary bg-secondary-10 h-[2px] w-full" />
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
							{
								/* const tp = logic.getIconFromType(noti.type); */
							}
							const [expand, setExpand] = createSignal(false);
							return (
								<div class="bg-secondary-05 border-secondary-15/60 pointer-events-auto h-fit w-full rounded-xl border p-2">
									<div
										class="flex items-center gap-4"
										style={
											{
												//color: tp.color,
											}
										}
									>
										{/* <Suspense> */}
										{/* 	<Icon */}
										{/* 		class="bg-secondary-15/60 size-10 shrink-0 rounded-lg p-2.5" */}
										{/* 		name={tp.icon} */}
										{/* 	/> */}
										{/* </Suspense> */}
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
				</Show>
			</div>
		</div>
	);
};
