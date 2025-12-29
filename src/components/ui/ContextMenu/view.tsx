import { ContextMenuProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import { Motion, Presence } from "solid-motionone";
import { Show, Component } from "solid-js";
import { hollow } from "hollow";
import {
	ChevronRightIcon,
	ClipboardPasteIcon,
	CopyIcon,
	ScissorsIcon,
} from "lucide-solid";
import { For } from "solid-js";
import { ContextMenuItem, ContextMenuItemButton } from "@type/hollow";
import { manager } from "@managers/index";
import { createSignal } from "solid-js";
import MyIcon from "@components/MyIcon";
import { DynamicIcon } from "@components/DynamicIcon";

const MenuButton: Component<{
	icon?: any;
	label: string;
	onclick: () => void;
	class?: string;
	iconClass?: string;
}> = (props) => (
	<button
		class={props.class || "button-cm active-cm"}
		onclick={() => {
			props.onclick();
			hollow.pevents.emit("context-menu", false);
		}}
	>
		<Show when={props.icon}>
			<DynamicIcon icon={props.icon} class={props.iconClass} />
		</Show>
		{props.label}
	</button>
);

const SectionHeader: Component<{
	title: string;
	showDivider?: boolean;
}> = (props) => (
	<div class="flex items-center gap-1">
		<h1 class="text-secondary-30 text-xs font-semibold uppercase">
			{props.title}
		</h1>
		<Show when={props.showDivider}>
			<hr class="border-secondary-10 flex-1 border-dashed" />
		</Show>
	</div>
);

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
						"bg-secondary context-menu text-secondary-90 popup-shadow pointer-events-auto fixed z-1000 w-60 space-y-2 rounded-lg p-1 select-none"
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
					<div class="border-secondary-15 rounded-lg border border-dashed p-2">
						<Show when={hollow.onCopy}>
							<>
								<Show when={hollow.onCut}>
									<MenuButton
										icon={ScissorsIcon}
										label="Cut"
										onclick={hollow.onCut}
										class="button-cm"
									/>
								</Show>
								<MenuButton
									icon={CopyIcon}
									label="Copy"
									onclick={hollow.onCopy}
									class="button-cm"
								/>
							</>
						</Show>
						<Show when={hollow.onPaste}>
							<MenuButton
								icon={ClipboardPasteIcon}
								label="Paste"
								onclick={hollow.onPaste}
								class="button-cm"
							/>
						</Show>
						<div id="context-menu-tool" class="space-y-2">
							<Show when={state.items()}>
								<For each={state.items()}>
									{(group: ContextMenuItem, index) => (
										<>
											<SectionHeader
												title={group.header}
												showDivider={index() !== 0}
											/>
											<div>
												<For each={group.items}>
													{(item) => (
														<Show
															when={
																!item.children
															}
															fallback={
																<ContextMenuSide
																	{...item}
																	position={
																		state.position
																	}
																/>
															}
														>
															<MenuButton
																icon={item.icon}
																label={
																	item.label
																}
																onclick={
																	item.onclick
																}
																iconClass="size-4.5"
															/>
														</Show>
													)}
												</For>
											</div>
										</>
									)}
								</For>
							</Show>
							<SectionHeader
								title={`${manager.realm.getCurrent().name} Realm`}
								showDivider={true}
							/>
							<div class="">
								<button
									class="button-cm"
									onclick={() => {
										manager.rust.reload();
										hollow.pevents.emit(
											"context-menu",
											false,
										);
									}}
								>
									<MyIcon name={"comet"} class="size-5" />
									Reload
								</button>
							</div>
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
				<DynamicIcon class="size-4.5" icon={icon} />
				{label}
				{children && (
					<ChevronRightIcon class="text-secondary-30 ml-auto" />
				)}
			</button>
			<Presence>
				<Show when={hovered()}>
					<Motion.div
						class="bg-secondary absolute mx-3 h-fit w-70 rounded-lg p-1 backdrop-blur-sm"
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
						<div class="border-secondary-15 rounded-lg border border-dashed p-2">
							<Show
								when={children?.length > 0}
								fallback={
									<p class="text-secondary-30 button-cm pointer-events-none">
										Empty
									</p>
								}
							>
								<For each={children}>
									{(child) => (
										<MenuButton
											icon={child.icon}
											label={child.label}
											onclick={child.onclick}
											iconClass="size-4.5"
										/>
									)}
								</For>
							</Show>
						</div>
					</Motion.div>
				</Show>
			</Presence>
		</div>
	);
}
