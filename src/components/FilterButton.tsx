import { createSignal, For, Show, onMount, onCleanup, JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { ListFilterPlusIcon } from "lucide-solid";
import { useDropdownPosition } from "../hooks/useDropdownPosition";

type DropdownItem = {
	label: string;
	checked?: boolean;
};

export type DropdownOption = {
	title?: string;
	value?: () => string | string[];
	isCheckBox?: boolean;
	items: DropdownItem[];
	onSelect: (v: string[] | string) => void;
};
export type FilterButtonProps = {
	options: () => DropdownOption[];
};

export default function FilterButton({ options }: FilterButtonProps) {
	const [isOpen, setIsOpen] = createSignal(false);
	let dropdownRef: HTMLDivElement | undefined;
	let listRef: HTMLUListElement | undefined;

	const { pos, updatePosition, handleClickOutside } = useDropdownPosition();

	const outsideClick = () => {
		handleClickOutside(dropdownRef, listRef, () => setIsOpen(false));
	};
	const toggleOpen = (e: MouseEvent) => {
		e.stopPropagation();
		if (!isOpen()) {
			updatePosition(dropdownRef);
			window.addEventListener("pointerdown", outsideClick);
		} else {
			window.removeEventListener("pointerdown", outsideClick);
		}
		setIsOpen(!isOpen());
	};

	onMount(() =>
		document.addEventListener("resize", () => updatePosition(dropdownRef)),
	);
	onCleanup(() =>
		document.removeEventListener("resize", () =>
			updatePosition(dropdownRef),
		),
	);

	return (
		<div ref={dropdownRef} class="group relative h-fit w-10">
			<button
				class="hover:bg-secondary-10 relative flex items-center justify-center rounded-md p-2"
				onClick={toggleOpen}
			>
				<ListFilterPlusIcon
					class="size-5 transition duration-300"
					classList={{
						"text-secondary-50": !isOpen(),
						"text-primary": isOpen(),
					}}
				/>
			</button>

			<Show when={isOpen()}>
				<Portal>
					<ul
						ref={listRef}
						class="bg-secondary-05 border-secondary-10 fixed z-50 max-h-60 overflow-y-auto rounded-md border text-sm shadow-lg"
						style={{
							top: `${pos().top}px`,
							left: `${pos().left}px`,
						}}
					>
						<div class="p-1">
							<For each={options()}>
								{(group) => (
									<div>
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
											value={group.value}
										/>
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
	hide?: () => void;
};

export function ItemsList({
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
					onClick={() => {
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
							hide?.();
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
