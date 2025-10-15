import { ChevronDownIcon } from "lucide-solid";
import { setOptions } from "marked";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";

type DropDownProps = {
	value?: () => string;
	items: string[];
	onSelect: (v: string) => void;
	placeholder?: string;
	readonly?: boolean;
	style?: any;
};

export default function DropDown({
	value,
	items,
	onSelect,
	placeholder,
	readonly = false,
	style,
}: DropDownProps) {
	const [query, setQuery] = createSignal(value() || "");
	const [isOpen, setIsOpen] = createSignal(false);
	const [filteredItems, setFilteredItems] = createSignal<string[]>(items);
	let dropdownRef: HTMLDivElement | undefined;
	let listRef: HTMLUListElement | undefined;

	const filterItems = () => {
		const searchTerm = query().toLowerCase();
		setFilteredItems(
			items.filter((item) => {
				const itemLower = item.toLowerCase();
				let lastIndex = -1;
				for (const char of searchTerm) {
					const index = itemLower.indexOf(char, lastIndex + 1);
					if (index === -1) return false;
					lastIndex = index;
				}
				return true;
			}),
		);
	};

	const handleSelect = (item: string) => {
		setQuery(item);
		setIsOpen(false);
		onSelect(item);
	};

	const handleChange = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setQuery(value);
		setIsOpen(true);
		filterItems();
		if (items.includes(value)) {
			onSelect(value);
		}
	};

	const handleClickOutside = (e: PointerEvent) => {
		if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
			setIsOpen(false);
		}
	};

	onMount(() => {
		document.addEventListener("pointerdown", handleClickOutside);
	});

	onCleanup(() => {
		document.removeEventListener("pointerdown", handleClickOutside);
	});

	return (
		<div
			ref={dropdownRef}
			class="group drop-down pointer-events-auto relative h-fit max-w-full"
			aria-expanded={isOpen()}
			style={style}
		>
			<input
				type="text"
				value={readonly ? value() : query()}
				oninput={handleChange}
				onClick={() => setIsOpen(!isOpen())}
				placeholder={placeholder}
				spellcheck="false"
				readonly={readonly}
				class="ease border-secondary-20 text-secondary-70 placeholder:text-secondary-40 hover:border-secondary-70 focus:border-primary bg-secondary-10/75 text-md h-fit w-full max-w-full cursor-pointer appearance-none rounded-md py-2 pr-3 pl-3 shadow-sm focus:shadow disabled:cursor-not-allowed disabled:opacity-50"
			/>
			<Show when={isOpen()}>
				<ul
					ref={listRef}
					class="bg-secondary-10 border-secondary absolute z-50 mt-2 max-h-40 overflow-x-hidden overflow-y-auto rounded-md p-1 text-sm shadow-lg"
					style={{
						width: "var(--w)",
					}}
				>
					<Show
						when={filteredItems().length > 0}
						fallback={
							<li class="text-secondary-40 px-3 py-2">
								No results found
							</li>
						}
					>
						<For each={filteredItems()}>
							{(item, index) => (
								<li
									id={`dropdown-item-${index()}`}
									onclick={() => handleSelect(item)}
									class="hover:bg-primary/10 text-secondary-60 hover:text-primary w-full cursor-pointer rounded bg-transparent px-3 py-2 text-xs"
									role="option"
								>
									{item}
								</li>
							)}
						</For>
					</Show>
				</ul>
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
