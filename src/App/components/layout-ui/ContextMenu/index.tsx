import {
	Component,
	Show,
	For,
	createSignal,
	onCleanup,
	createEffect,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { hollow } from "hollow";
import {
	ChevronRightIcon,
	ClipboardPasteIcon,
	CopyIcon,
	ScissorsIcon,
	VaultIcon,
} from "lucide-solid";
import { ContextMenuItem, ContextMenuItemButton } from "@type/hollow";
import { DynamicIcon } from "@components/ui/DynamicIcon";
import MyIcon from "@components/ui/MyIcon";
import { useContextMenu, ContextMenuProps } from "./hooks";
import {
	computePosition,
	autoUpdate,
	offset,
	flip,
	shift,
} from "@floating-ui/dom";
import { getCurrentRealm } from "@managers/Realm";
import { reload } from "../../../../Hollow/rust";

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

export const ContextMenu: Component<ContextMenuProps> = (props) => {
	const { state } = useContextMenu();

	return (
		<Presence>
			<Show when={state.isVisible()}>
				<Motion.div
					class={
						"pointer-events-auto fixed z-1000 min-w-60 select-none"
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
					<div class="bg-secondary popup-shadow context-menu space-y-2 rounded-lg p-1">
						<div class="border-secondary-15 rounded-lg border border-dashed p-2">
							<Show when={hollow.onCopy}>
								<>
									<Show when={hollow.onCut}>
										<MenuButton
											icon={ScissorsIcon}
											label="Cut"
											onclick={hollow.onCut!}
											class="button-cm"
										/>
									</Show>
									<MenuButton
										icon={CopyIcon}
										label="Copy"
										onclick={hollow.onCopy!}
										class="button-cm"
									/>
								</>
							</Show>
							<Show when={hollow.onPaste}>
								<MenuButton
									icon={ClipboardPasteIcon}
									label="Paste"
									onclick={hollow.onPaste!}
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
																	/>
																}
															>
																<MenuButton
																	icon={
																		item.icon
																	}
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
									title={`${getCurrentRealm().name} Realm`}
									showDivider={true}
								/>
								<div class="">
									<button
										class="button-cm"
										onclick={() => {
											reload();
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
					</div>
				</Motion.div>
			</Show>
		</Presence>
	);
};

function ContextMenuSide({ icon, label, children }: ContextMenuItemButton) {
	const [hovered, setHovered] = createSignal(false);
	const [position, setPosition] = createSignal<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	let buttonRef: HTMLButtonElement | undefined;
	let sideMenuRef: HTMLDivElement | undefined;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let cleanupAutoUpdate: (() => void) | undefined;

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

	const updatePosition = () => {
		if (!buttonRef || !sideMenuRef) return;

		computePosition(buttonRef, sideMenuRef, {
			placement: "right-start",
			middleware: [offset(12), flip(), shift({ padding: 8 })],
		}).then(({ x, y }) => {
			setPosition({ x, y });
		});
	};

	createEffect(() => {
		if (hovered() && buttonRef && sideMenuRef) {
			requestAnimationFrame(() => {
				updatePosition();
				cleanupAutoUpdate?.();
				cleanupAutoUpdate = autoUpdate(
					buttonRef!,
					sideMenuRef!,
					updatePosition,
				);
			});
		} else {
			cleanupAutoUpdate?.();
			cleanupAutoUpdate = undefined;
		}
	});

	onCleanup(() => {
		cleanupAutoUpdate?.();
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	});

	return (
		<div class="relative" onMouseLeave={handleMouseLeave}>
			<button
				ref={buttonRef}
				class="button-cm"
				onMouseOver={handleMouseOver}
			>
				<Show when={icon}>
					<DynamicIcon class="size-4.5" icon={icon} />
				</Show>
				{label}
				{children && (
					<ChevronRightIcon class="text-secondary-30 ml-auto" />
				)}
			</button>
			<Presence>
				<Show when={hovered()}>
					<Motion.div
						ref={sideMenuRef}
						class="bg-secondary fixed z-1001 h-fit w-70 rounded-lg p-1 backdrop-blur-sm"
						onMouseOver={handleMouseOver}
						style={{
							left: `${position().x}px`,
							top: `${position().y}px`,
						}}
						initial={{ opacity: 0, y: -25 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -25 }}
						transition={{ duration: 0.3 }}
					>
						<div class="border-secondary-15 rounded-lg border border-dashed p-2">
							<Show
								when={children && children.length > 0}
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

export default ContextMenu;
