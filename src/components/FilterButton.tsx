import { createSignal, For, Show } from "solid-js";
import { ListFilterPlusIcon, CheckIcon } from "lucide-solid";
import Floater from "@utils/kinda-junk/Floater";

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
		<div ref={dropdownRef} class="relative">
			<button
				class="hover:bg-secondary-10 text-secondary-60 hover:text-secondary-foreground flex h-9 w-9 items-center justify-center rounded-md transition-colors"
				onClick={toggleOpen}
				classList={{
					"bg-secondary-10 text-secondary-foreground": isOpen(),
				}}
			>
				<ListFilterPlusIcon class="size-4" />
			</button>

			<Show when={isOpen()}>
				<Floater hide={() => setIsOpen(false)} includedEl={dropdownRef}>
					<div class="bg-secondary-05 border-secondary-10 text-secondary-foreground animate-in fade-in zoom-in-95 mt-3 w-fit overflow-hidden rounded-md border shadow-md">
						<div class="max-h-80 overflow-y-auto p-1">
							<For
								each={options().filter(
									(i) => i.items.length > 0,
								)}
							>
								{(group, i) => (
									<div>
										<Show when={group.title}>
											<div class="px-2 py-1.5 text-xs font-semibold text-neutral-500">
												{group.title}
											</div>
										</Show>
										<ItemsList
											items={() => group.items}
											isCheckBox={group.isCheckBox}
											onSelect={group.onSelect}
											value={group.value}
											hide={() => setIsOpen(false)}
										/>
									</div>
								)}
							</For>
						</div>
					</div>
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
			{(item) => {
				const isSelected = () => {
					if (isCheckBox) return selected().includes(item.label);
					if (value) {
						const v = value();
						return (
							v === item.label ||
							(Array.isArray(v) && v.includes(item.label))
						);
					}
					return false;
				};

				return (
					<div
						class="hover:bg-secondary-10 hover:text-secondary-foreground relative flex cursor-pointer items-center rounded-sm py-1.5 pr-10 pl-2 text-sm transition-colors outline-none select-none"
						onClick={() => {
							if (isCheckBox) {
								const checked = !selected().includes(
									item.label,
								);
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
						<span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
							<Show when={isSelected()}>
								<CheckIcon class="size-4" />
							</Show>
						</span>
						<span class="pl-8">{item.label}</span>
					</div>
				);
			}}
		</For>
	);
}
