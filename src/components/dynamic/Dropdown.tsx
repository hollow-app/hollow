import { on, createSignal, For, Show, createEffect } from "solid-js";
import { ChevronsUpDownIcon } from "lucide-solid";
import Floater from "@utils/kinda-junk/Floater";

export type DropdownProps = {
	value?: string;
	options: { title?: string; items: string[] }[];
	onSelect: (v: string) => void;
	placeholder?: string;
	visibleOnSelect?: boolean;
};

export default function Dropdown(props: DropdownProps) {
	const [isOpen, setIsOpen] = createSignal(false);
	const [innerValue, setInnerValue] = createSignal(props.value ?? "");
	let dropdownRef: HTMLDivElement | undefined;

	createEffect(
		on(
			() => props.value,
			(v) => {
				setInnerValue(v);
			},
			{ defer: true },
		),
	);

	const toggleOpen = () => {
		setIsOpen((p) => !p);
	};

	const selectItem = (item: string) => {
		props.onSelect(item);
		setInnerValue(item);
		!props.visibleOnSelect && setIsOpen(false);
	};
	return (
		<div ref={dropdownRef} class="drop-down relative h-fit outline-none">
			<div
				onClick={toggleOpen}
				class="outline-none"
				style={{ width: "var(--w)" }}
			>
				<input
					type="text"
					value={innerValue()}
					placeholder={props.placeholder}
					readonly
					class="border-secondary-15 placeholder:text-secondary-40 bg-secondary-05 relative w-full cursor-pointer rounded-md border px-2.5 py-2 text-sm text-neutral-950 shadow-sm outline-none dark:text-neutral-50"
				/>
				<ChevronsUpDownIcon
					class="text-secondary-40 absolute top-0 right-3 size-4 h-full transition duration-300"
					classList={{ "text-primary": isOpen() }}
				/>
			</div>

			<Show when={isOpen()}>
				<Floater
					hide={() => setIsOpen(false)}
					includedEl={dropdownRef!}
					placement="bottom-start"
				>
					<div
						class="bg-secondary-05 border-secondary-10 popup-shadow drop-down-list overflow-hidden rounded-md border text-sm"
						style={{
							width:
								dropdownRef?.getBoundingClientRect().width +
								"px",
						}}
					>
						<div class="scrollbar-hidden max-h-60 w-full overflow-y-auto">
							<div class="p-1.5">
								<For each={props.options}>
									{(group) => (
										<div class="relative">
											<Show when={group.title}>
												<div class="bg-secondary-05 sticky top-0 z-20 flex w-full items-center gap-1 px-3">
													<h1 class="overflow-hidden py-1.5 text-xs font-medium text-neutral-500">
														{group.title}
													</h1>
												</div>
											</Show>
											<ul>
												<Show
													when={
														group.items.length > 0
													}
													fallback={
														<li class="w-full text-center text-xs text-neutral-500">
															Nothing here.
														</li>
													}
												>
													<For each={group.items}>
														{(item) => (
															<li
																class="hover:bg-primary/10 hover:text-primary relative flex w-full cursor-pointer justify-between rounded-md bg-transparent px-3 py-2 text-xs text-neutral-800 dark:text-neutral-300"
																onClick={() =>
																	selectItem(
																		item,
																	)
																}
																classList={{
																	"underline before:content-[''] before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:size-1 before:bg-primary before:rounded-full":
																		innerValue() ===
																		item,
																}}
															>
																{item}
															</li>
														)}
													</For>
												</Show>
											</ul>
										</div>
									)}
								</For>
							</div>
						</div>
					</div>
				</Floater>
			</Show>
		</div>
	);
}
