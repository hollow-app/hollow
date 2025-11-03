import {
	ClipboardPasteIcon,
	CopyIcon,
	RefreshCcw,
	RefreshCcwIcon,
	ScissorsIcon,
} from "lucide-solid";
import {
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
	Suspense,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { ContextMenuItem } from "@type/hollow";
import ContextMenuSide from "./ContextMenuSide";
import { lazy } from "solid-js";
import { RealmManager } from "@managers/RealmManager";
import { hollow } from "hollow";
import { RustManager } from "@managers/RustManager";
const Icon = lazy(() => import("@components/Icon"));

export default function ContextMenu() {
	let contextMenu!: HTMLDivElement;
	const [items, setItems] = createSignal<ContextMenuItem[]>([]);
	const [position, setPosition] = createSignal({
		x: 300,
		y: 300,
		xflip: false,
		yflip: false,
	});
	const [isVisible, setVisible] = createSignal(false);

	const onContextMenu = (e: MouseEvent) => {
		e.preventDefault();

		const selection = window.getSelection();
		const selectedText = selection?.toString().trim();
		const target = e.target;

		if (
			(target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement) &&
			!target.readOnly &&
			!target.disabled
		) {
			if (selectedText) {
				hollow.onCut = () => {
					const start = target.selectionStart;
					const end = target.selectionEnd;
					target.value =
						target.value.slice(0, start) + target.value.slice(end);
					target.setSelectionRange(start, start);
					navigator.clipboard.writeText(selectedText);
					hollow.onCut = null;
					setVisible(false);
				};
			}
			hollow.onPaste = async () => {
				const copiedValue = await navigator.clipboard.readText();
				const start = target.selectionStart;
				const end = target.selectionEnd;
				target.value =
					target.value.slice(0, start) +
					copiedValue +
					target.value.slice(end);
				target.setSelectionRange(start, start);
				hollow.onPaste = null;
				setVisible(false);
			};
		} else {
			hollow.onPaste = null;
		}

		if (selectedText) {
			hollow.onCopy = () => {
				navigator.clipboard.writeText(selectedText);
				hollow.onCopy = null;
				setVisible(false);
			};
		} else {
			hollow.onCopy = null;
			hollow.onCut = null;
		}

		const x = e.clientX;
		const y = e.clientY;

		setVisible(true);
		const flipx = x > window.innerWidth - contextMenu.scrollWidth;
		const flipy = y > window.innerHeight - contextMenu.scrollHeight;
		setPosition({
			x: flipx ? x - contextMenu.scrollWidth : x,
			y: flipy ? y - contextMenu.scrollHeight : y,
			xflip: x > window.innerWidth - contextMenu.scrollWidth * 2,
			yflip: y > window.innerHeight - contextMenu.scrollHeight * 2,
		});

		requestAnimationFrame(() => contextMenu.focus());
		document.body.addEventListener("mousedown", onFocusOut);
	};
	const onFocusOut = (e: MouseEvent) => {
		if (contextMenu && !contextMenu.contains(e.target as Node)) {
			setVisible(false);
			document.body.removeEventListener("mousedown", onFocusOut);
		}
	};
	const addItems = (newItems: ContextMenuItem) => {
		setItems((prev: ContextMenuItem[]) =>
			prev.some((i) => i.id === newItems.id)
				? prev.map((i) => (i.id === newItems.id ? { ...newItems } : i))
				: [...prev, newItems],
		);
	};
	onMount(() => {
		document.body.oncontextmenu = onContextMenu;
		hollow.events.on("context-menu", showContextMenu);
		hollow.events.on("context-menu-extend", addItems);
	});
	onCleanup(() => {
		hollow.events.off("context-menu", showContextMenu);
		hollow.events.off("context-menu-extend", addItems);
	});
	const showContextMenu = (b: boolean) => setVisible(b);

	return (
		<Presence>
			<Show when={isVisible()}>
				<Motion.div
					class={
						"border-secondary-05 bg-secondary text-secondary-90 pointer-events-auto fixed z-200 w-60 space-y-2 rounded-lg border px-2 py-2 shadow-[0_0_5px_1px_gray] select-none dark:shadow-[0_0_5px_1px_black]"
					}
					style={{
						left: `${position().x}px`,
						top: `${position().y}px`,
					}}
					ref={contextMenu}
					onMouseDown={(e) => e.stopPropagation()}
					initial={{ opacity: 0, y: -25 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -25 }}
					transition={{ duration: 0.3 }}
					onMotionComplete={() => !isVisible() && setItems([])}
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
						<Show when={items()}>
							<For each={items()}>
								{(group: ContextMenuItem) => (
									<>
										<div class="flex items-center gap-1">
											<h1 class="text-secondary-30 text-xs font-semibold uppercase">
												{group.header}
											</h1>
											<hr class="border-secondary-10 flex-1" />
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
																	position
																}
															/>
														}
													>
														<button
															class="button-cm active-cm"
															onclick={() => {
																item.onclick();
																hollow.events.emit(
																	"context-menu",
																	false,
																);
															}}
														>
															<Show
																when={item.icon}
															>
																<Suspense>
																	<Icon
																		name={
																			item.icon
																		}
																		class="h-4 w-4"
																	/>
																</Suspense>
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
								{
									RealmManager.getSelf().getRealmFromId(
										RealmManager.getSelf().currentRealmId,
									).name
								}
								{" Realm"}
							</h1>
							<hr class="border-secondary-10 flex-1" />
						</div>
						<div class="">
							<button
								class="button-cm"
								onclick={() => RustManager.getSelf().reload()}
							>
								<RefreshCcwIcon class="size-4" />
								Reload
							</button>
						</div>
					</div>
				</Motion.div>
			</Show>
		</Presence>
	);
}
