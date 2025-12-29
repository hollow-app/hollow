import { createSignal, For, Show, onMount, onCleanup, JSX } from "solid-js";
import { ListFilterPlusIcon } from "lucide-solid";
import Floater from "@utils/kinda-junk/Floater";
import MyIcon from "./MyIcon";

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

	const toggleOpen = (e: MouseEvent) => {
		e.stopPropagation();
		setIsOpen(!isOpen());
	};

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
				<Floater hide={() => setIsOpen(false)} includedEl={dropdownRef}>
					<ul class="bg-secondary-05 popup-shadow mt-2 max-h-60 min-w-20 rounded-md p-1 text-sm">
						<div class="border-secondary-15 scrollbar-hidden max-h-60 w-full overflow-y-auto rounded-md border border-dashed">
							<div class="p-1">
								<For
									each={options().filter(
										(i) => i.items.length > 0,
									)}
								>
									{(group) => (
										<div>
											<Show when={group.title}>
												<div class="bg-secondary-05 sticky -top-px z-20 flex w-full items-center gap-1 pt-1">
													<h1 class="py-1 pl-2 text-xs text-neutral-500 uppercase">
														{group.title}
													</h1>
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
						</div>
					</ul>
				</Floater>
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
					class="hover:bg-primary/10 text-secondary-60 hover:text-primary relative flex w-full min-w-30 cursor-pointer justify-between gap-5 rounded bg-transparent px-3 py-2 text-xs"
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
					<Show when={isCheckBox && selected().includes(item.label)}>
						<MyIcon name="check" class="size-4" />
					</Show>
				</li>
			)}
		</For>
	);
}
