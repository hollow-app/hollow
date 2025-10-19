import { ClipboardPasteIcon, CopyIcon, ScissorsIcon } from "lucide-solid";
import {
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
	Suspense,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { ContextMenuItem } from "@type/ContextMenuItem";
import ContextMenuSide from "./ContextMenuSide";
import { lazy } from "solid-js";
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
				window.onCut = () => {
					const start = target.selectionStart;
					const end = target.selectionEnd;
					target.value =
						target.value.slice(0, start) + target.value.slice(end);
					target.setSelectionRange(start, start);
					navigator.clipboard.writeText(selectedText);
					window.onCut = null;
					setVisible(false);
				};
			}
			window.onPaste = async () => {
				const copiedValue = await navigator.clipboard.readText();
				const start = target.selectionStart;
				const end = target.selectionEnd;
				target.value =
					target.value.slice(0, start) +
					copiedValue +
					target.value.slice(end);
				target.setSelectionRange(start, start);
				window.onPaste = null;
				setVisible(false);
			};
		} else {
			window.onPaste = null;
		}

		if (selectedText) {
			window.onCopy = () => {
				navigator.clipboard.writeText(selectedText);
				window.onCopy = null;
				setVisible(false);
			};
		} else {
			window.onCopy = null;
			window.onCut = null;
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
		window.hollowManager.on("context-menu", showContextMenu);
		window.hollowManager.on("context-menu-extend", addItems);
	});
	onCleanup(() => {
		window.hollowManager.off("context-menu", showContextMenu);
		window.hollowManager.off("context-menu-extend", addItems);
	});
	const showContextMenu = (b: boolean) => setVisible(b);

	return (
		<Presence>
			<Show when={isVisible()}>
				<Motion
					class={
						"border-secondary-05 bg-secondary/80 text-secondary-90 pointer-events-auto fixed z-200 w-70 space-y-2 rounded-lg border px-2 py-2 shadow-[0_0_30px_3px_gray] backdrop-blur-sm dark:shadow-[0_0_30px_3px_black]"
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
					<Show when={window.onCopy}>
						<>
							<Show when={window.onCut}>
								<button
									class="button-cm"
									onclick={window.onCut}
								>
									<ScissorsIcon class="h-4 w-4" />
									Cut
								</button>
							</Show>
							<button class="button-cm" onclick={window.onCopy}>
								<CopyIcon class="h-4 w-4" />
								Copy
							</button>
						</>
					</Show>
					<Show when={window.onPaste}>
						<button class="button-cm" onclick={window.onPaste}>
							<ClipboardPasteIcon class="h-4 w-4" />
							Paste
						</button>
					</Show>
					{/* <Show when={window.onPaste || window.onCopy}> */}
					{/* 	<hr class="hr-cm" /> */}
					{/* </Show> */}
					<div id="context-menu-tool" class="space-y-2">
						<Show when={items()}>
							<For each={items()}>
								{(group: ContextMenuItem) => (
									<>
										<div class="flex items-center gap-1">
											<hr class="border-secondary-10 w-2" />
											<h1 class="text-secondary-30 text-xs font-semibold uppercase">
												{group.header}
											</h1>
											<hr class="border-secondary-10 flex-1" />
										</div>
										<div>
											<For each={group.items}>
												{(item) =>
													item.children ? (
														<ContextMenuSide
															{...item}
															position={position}
														/>
													) : (
														<button
															class="button-cm active-cm"
															onclick={() => {
																item.onclick();
																window.hollowManager.emit(
																	"context-menu",
																	false,
																);
															}}
														>
															<Suspense>
																{" "}
																<Icon
																	name={
																		item.icon
																	}
																	class="h-4 w-4"
																/>
															</Suspense>
															{item.label}
														</button>
													)
												}
											</For>
										</div>
									</>
								)}
							</For>
						</Show>
					</div>
					<div id="context-menu-vault"></div>
					<p class="text-secondary-40 border-secondary-10 border-t px-0 pt-1 text-xs tracking-wide">
						{
							window.realmManager.getRealmFromId(
								window.realmManager.currentRealmId,
							).name
						}
						{" Realm"}
					</p>
				</Motion>
			</Show>
		</Presence>
	);
}
