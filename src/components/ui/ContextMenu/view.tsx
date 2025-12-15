import { ContextMenuProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import { Motion, Presence } from "solid-motionone";
import { Accessor, JSX, Show, Suspense } from "solid-js";
import { hollow } from "hollow";
import {
	ChevronRightIcon,
	ClipboardPasteIcon,
	CopyIcon,
	RefreshCcwIcon,
	ScissorsIcon,
} from "lucide-solid";
import { For } from "solid-js";
import { ContextMenuItem, ContextMenuItemButton } from "@type/hollow";
import { lazy } from "solid-js";
import { RealmManager } from "@managers/RealmManager";
import { RustManager } from "@managers/RustManager";
import { createSignal } from "solid-js";
import ToolIcon from "@components/ToolIcon";
import MyIcon from "@components/MyIcon";

export const ContextMenuView = (
	state: StateType,
	logic: LogicType,
	props: ContextMenuProps,
	helper?: HelperType,
) => {
	return (
		<Presence>
			<Show when={state.isVisible()}>
				<Motion.div
					class={
						"border-secondary-10 bg-secondary text-secondary-90 pointer-events-auto fixed z-200 w-60 space-y-2 rounded-lg border px-2 py-2 shadow-[0_0_5px_1px_gray] select-none dark:shadow-[0_0_5px_1px_black]"
					}
					style={{
						left: `${state.position().x}px`,
						top: `${state.position().y}px`,
					}}
					ref={state.setEl}
					onMouseDown={(e) => e.stopPropagation()}
					initial={{ opacity: 0, y: -25 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -25 }}
					transition={{ duration: 0.3 }}
					onMotionComplete={() =>
						!state.isVisible() && state.setItems([])
					}
				>
					<Show when={hollow.onCopy}>
						<>
							<Show when={hollow.onCut}>
								<button
									class="button-cm"
									onclick={hollow.onCut}
								>
									<ScissorsIcon class="h-4 w-4" />
									Cut
								</button>
							</Show>
							<button class="button-cm" onclick={hollow.onCopy}>
								<CopyIcon class="h-4 w-4" />
								Copy
							</button>
						</>
					</Show>
					<Show when={hollow.onPaste}>
						<button class="button-cm" onclick={hollow.onPaste}>
							<ClipboardPasteIcon class="h-4 w-4" />
							Paste
						</button>
					</Show>
					{/* <Show when={hollow.onPaste || hollow.onCopy}> */}
					{/* 	<hr class="hr-cm" /> */}
					{/* </Show> */}
					<div id="context-menu-tool" class="space-y-2">
						<Show when={state.items()}>
							<For each={state.items()}>
								{(group: ContextMenuItem, index) => (
									<>
										<div class="flex items-center gap-1">
											<h1 class="text-secondary-30 text-xs font-semibold uppercase">
												{group.header}
											</h1>
											<Show when={index() !== 0}>
												<hr class="border-secondary-05 flex-1" />
											</Show>
										</div>
										<div>
											<For each={group.items}>
												{(item) => (
													<Show
														when={!item.children}
														fallback={
															<ContextMenuSide
																{...item}
																position={
																	state.position
																}
															/>
														}
													>
														<button
															class="button-cm active-cm"
															onclick={() => {
																item.onclick();
																hollow.pevents.emit(
																	"context-menu",
																	false,
																);
															}}
														>
															<Show
																when={item.icon}
															>
																{(() => {
																	const Icon =
																		item.icon;
																	return (
																		<Icon class="h-4.5 w-4.5" />
																	);
																})()}
															</Show>
															{item.label}
														</button>
													</Show>
												)}
											</For>
										</div>
									</>
								)}
							</For>
						</Show>
						<div class="flex items-center gap-1">
							<h1 class="text-secondary-30 text-xs font-semibold uppercase">
								{RealmManager.getSelf().getCurrent().name}
								{" Realm"}
							</h1>
							<hr class="border-secondary-05 flex-1" />
						</div>
						<div class="">
							<button
								class="button-cm"
								onclick={() => RustManager.getSelf().reload()}
							>
								<MyIcon name={"comet"} class="size-5" />
								Reload
							</button>
						</div>
					</div>
				</Motion.div>
			</Show>
		</Presence>
	);
};

function ContextMenuSide({
	icon,
	label,
	children,
	position,
}: ContextMenuItemButton & {
	position: () => { xflip: boolean; yflip: boolean };
}) {
	const [hovered, setHovered] = createSignal(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	const handleMouseOver = () => {
		setHovered(true);
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};
	const handleMouseLeave = () => {
		timeoutId = setTimeout(() => {
			setHovered(false);
		}, 300);
	};

	return (
		<div class="relative" onMouseLeave={handleMouseLeave}>
			<button class="button-cm" onMouseOver={handleMouseOver}>
				<Show when={icon}>
					{(() => {
						const Icon = icon;
						return <Icon class="h-4 w-4" />;
					})()}
				</Show>
				{label}
				{children && (
					<ChevronRightIcon class="text-secondary-30 ml-auto" />
				)}
			</button>
			<Presence>
				<Show when={hovered()}>
					<Motion.div
						class="bg-secondary border-secondary-10 absolute mx-3 h-fit w-70 rounded-lg border p-2 backdrop-blur-sm"
						onMouseOver={handleMouseOver}
						classList={{
							"right-[100%]": position().xflip,
							"bottom-0": position().yflip,
							"left-[100%]": !position().xflip,
							"top-0": !position().yflip,
						}}
						initial={{ opacity: 0, y: -25 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -25 }}
						transition={{ duration: 0.3 }}
					>
						<For each={children}>
							{(child) => (
								<button
									class="button-cm active-cm"
									onclick={() => {
										child.onclick();
										hollow.events.emit(
											"context-menu",
											false,
										);
									}}
								>
									<Show when={child.icon}>
										{(() => {
											const Icon = child.icon;
											return <Icon class="h-4 w-4" />;
										})()}
									</Show>
									{child.label}
								</button>
							)}
						</For>
						{children.length === 0 && (
							<p class="text-secondary-30 button-cm pointer-events-none">
								Empty
							</p>
						)}
					</Motion.div>
				</Show>
			</Presence>
		</div>
	);
}
