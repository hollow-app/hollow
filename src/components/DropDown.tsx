import { ItemType } from "@coretools/Kanban/types/ItemType";
import { DropdownOption } from "@type/hollow";
import { ChevronDownIcon } from "lucide-solid";
import { platform } from "os";
import { createSignal, For, JSX, onCleanup, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";

export type DropDownProps = {
	value?: () => string;
	options: () => DropdownOption[];
	placeholder?: string;
	style?: JSX.CSSProperties;
};

export default function DropDown({
	value,
	options,
	placeholder,
	style,
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
			// setIsOpen(false);
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
			class="group drop-down pointer-events-auto relative h-fit max-w-full"
			aria-expanded={isOpen()}
			style={style}
		>
			<input
				ref={inputRef}
				type="text"
				value={value()}
				onClick={toggleOpen}
				placeholder={placeholder}
				spellcheck="false"
				readonly
				class="ease border-secondary-20 text-secondary-70 placeholder:text-secondary-40 hover:border-secondary-70 focus:border-primary bg-secondary-10/75 text-md relative h-fit w-full max-w-full cursor-pointer appearance-none rounded-md py-2 pr-3 pl-3 shadow-sm focus:shadow disabled:cursor-not-allowed disabled:opacity-50"
			/>
			<Show when={isOpen()}>
				<Portal>
					<ul
						ref={listRef}
						class="bg-secondary-10 border-secondary-05 fixed z-50 max-h-40 overflow-x-hidden overflow-y-auto rounded-md border text-sm shadow-lg"
						style={{
							top: `${pos().top}px`,
							left: `${pos().left}px`,
							width: `${inputRef.getBoundingClientRect().width}px`,
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
												<div class="bg-secondary-10 sticky top-0 z-20 flex w-full items-center gap-1">
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
											/>
										</Show>
									</div>
								)}
							</For>
						</div>
					</ul>
				</Portal>
			</Show>
			<ChevronDownIcon
				class="pointer-events-none absolute top-0 right-1 h-full transition duration-300"
				classList={{
					"text-secondary-20": !isOpen(),
					"text-primary": isOpen(),
				}}
				aria-hidden="true"
			/>
		</div>
	);
}

type ItemsListProps = {
	isCheckBox?: boolean;
	items: () => { label: string; checked?: boolean }[];
	onSelect: (v: string | string[]) => void;
	hide: () => void;
};
function ItemsList({ items, isCheckBox, onSelect, hide }: ItemsListProps) {
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
					class="hover:bg-primary/10 text-secondary-60 hover:text-primary flex w-full cursor-pointer justify-between rounded bg-transparent px-3 py-2 text-xs"
					role="option"
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
							checked={selected().includes(item.label)}
						/>
					</Show>
				</li>
			)}
		</For>
	);
}
