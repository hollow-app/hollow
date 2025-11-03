import { DropdownOption } from "@type/hollow";
import { ChevronDownIcon, ListFilterPlusIcon } from "lucide-solid";
import { createSignal, For, JSX, onCleanup, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";

export type DropDownProps = {
	value?: () => string;
	options: () => DropdownOption[];
	placeholder?: string;
	style?: JSX.CSSProperties;
	isFilter?: boolean;
};

export default function DropDown({
	value,
	options,
	placeholder,
	style = { "--w": "fit-content" },
	isFilter,
}: DropDownProps) {
	const [isOpen, setIsOpen] = createSignal(false);
	let dropdownRef: HTMLDivElement | undefined;
	let listRef: HTMLUListElement | undefined;
	let inputRef: HTMLInputElement | undefined;
	const [pos, setPos] = createSignal({
		top: 0,
		left: 0,
		openUp: false,
	});
	const updatePosition = () => {
		if (!inputRef) return;
		const rect = inputRef.getBoundingClientRect();
		const dropdownHeight = 160;
		const spaceBelow = window.innerHeight - rect.bottom;
		const openUp = spaceBelow < dropdownHeight;

		setPos({
			top: openUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
			left: rect.left,
			openUp,
		});
	};

	const handleClickOutside = (e: PointerEvent) => {
		const target = e.target as Node;
		if (
			dropdownRef &&
			!dropdownRef.contains(target) &&
			listRef &&
			!listRef.contains(target)
		) {
			setIsOpen(false);
		}
	};
	const toggleOpen = () => {
		if (!isOpen()) {
			updatePosition();
			window.addEventListener("pointerdown", handleClickOutside);
		} else {
			window.removeEventListener("pointerdown", handleClickOutside);
		}
		setIsOpen(!isOpen());
	};

	onMount(() => {
		document.addEventListener("resize", updatePosition);
	});

	onCleanup(() => {
		document.removeEventListener("resize", updatePosition);
	});

	return (
		<div
			ref={dropdownRef}
			class="group pointer-events-auto relative h-fit"
			classList={{
				"w-10": isFilter,
				"drop-down ": !isFilter,
			}}
			style={isFilter ? {} : style}
		>
			<button onClick={toggleOpen}>
				<input
					ref={inputRef}
					type="text"
					value={value ? value() : ""}
					placeholder={placeholder}
					spellcheck="false"
					readonly
					class="ease border-secondary-20 text-secondary-70 placeholder:text-secondary-40 hover:border-secondary-70 focus:border-primary bg-secondary-10/75 text-md relative h-fit w-full cursor-pointer appearance-none rounded-md px-3 py-2 shadow-sm focus:shadow disabled:cursor-not-allowed disabled:opacity-50"
				/>
				<Show
					when={isFilter}
					fallback={
						<ChevronDownIcon
							class="pointer-events-none absolute top-0 right-1 h-full transition duration-300"
							classList={{
								"text-secondary-20": !isOpen(),
								"text-primary": isOpen(),
							}}
							aria-hidden="true"
						/>
					}
				>
					<ListFilterPlusIcon
						class="absolute top-2.5 left-2.5 size-5 transition duration-300"
						classList={{
							"text-secondary-50": !isOpen(),
							"text-primary": isOpen(),
						}}
					/>
				</Show>
			</button>
			<Show when={isOpen()}>
				<Portal>
					<ul
						ref={listRef}
						class="bg-secondary-05 drop-down border-secondary-10 fixed z-50 max-h-60 overflow-x-hidden overflow-y-auto rounded-md border text-sm shadow-lg"
						style={{
							top: `${pos().top}px`,
							left: `${pos().left}px`,
							...(isFilter
								? style
								: {
										width: `${dropdownRef.getBoundingClientRect().width}px`,
									}),
						}}
					>
						<div class="p-1">
							<For each={options()}>
								{(group: DropdownOption) => (
									<div>
										<Show
											when={group.items.length > 0}
											fallback={
												<li class="text-secondary-40 px-3 py-2">
													No results found
												</li>
											}
										>
											<Show when={group.title}>
												<div class="bg-secondary-05 sticky -top-px z-20 flex w-full items-center gap-1 pt-1">
													<h1 class="py-1 pl-2 text-xs text-neutral-500 uppercase">
														{group.title}
													</h1>
													<hr class="bg-secondary-15 h-px flex-1 border-0" />
												</div>
											</Show>
											<ItemsList
												items={() => group.items}
												isCheckBox={group.isCheckBox}
												onSelect={group.onSelect}
												hide={() => setIsOpen(false)}
												value={group.value}
											/>
										</Show>
									</div>
								)}
							</For>
						</div>
					</ul>
				</Portal>
			</Show>
		</div>
	);
}

type ItemsListProps = {
	isCheckBox?: boolean;
	value?: () => string | string[];
	items: () => { label: string; checked?: boolean }[];
	onSelect: (v: string | string[]) => void;
	hide: () => void;
};
function ItemsList({
	items,
	isCheckBox,
	onSelect,
	hide,
	value,
}: ItemsListProps) {
	const [selected, setSelected] = createSignal(
		isCheckBox
			? items()
					.filter((i) => i.checked)
					.map((i) => i.label)
			: [],
	);

	return (
		<For each={items().sort((a, b) => a.label.localeCompare(b.label))}>
			{(item) => (
				<li
					class="hover:bg-primary/10 text-secondary-60 hover:text-primary relative flex w-full cursor-pointer justify-between rounded bg-transparent px-3 py-2 text-xs"
					role="option"
					classList={{
						"underline before:content-[''] before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:size-1 before:bg-primary before:rounded-full":
							!isCheckBox && value && value() === item.label,
					}}
					onclick={() => {
						if (isCheckBox) {
							const checked = !selected().includes(item.label);
							setSelected((prev) =>
								checked
									? [...prev, item.label]
									: prev.filter((i) => i !== item.label),
							);
							onSelect(selected());
						} else {
							onSelect(item.label);
							hide();
						}
					}}
				>
					{item.label}
					<Show when={isCheckBox}>
						<input
							class="checkbox"
							type="checkbox"
							style={{ "--margin": "0 0 0 10px" }}
							checked={selected().includes(item.label)}
						/>
					</Show>
				</li>
			)}
		</For>
	);
}
