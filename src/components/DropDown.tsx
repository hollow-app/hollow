import { ArrowDownUpIcon, ChevronDownIcon } from "lucide-solid";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";

type DropDownProps = {
	value?: string;
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
	const [query, setQuery] = createSignal(value || "");
	const [isOpen, setIsOpen] = createSignal(false);
	const [filteredItems, setFilteredItems] = createSignal<string[]>(items);
	const [activeIndex, setActiveIndex] = createSignal(-1);
	let dropdownRef: HTMLDivElement | undefined;
	let listRef: HTMLUListElement | undefined;

	const filterItems = () => {
		const searchTerm = query().toLowerCase();
		setFilteredItems(
			items.filter((item) => {
				const itemLower = item.toLowerCase();
				// Simple fuzzy search
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
		setActiveIndex(-1);
	};

	const handleChange = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		setQuery(value);
		setIsOpen(true);
		setActiveIndex(-1);
		filterItems();
		if (items.includes(value)) {
			onSelect(value);
		}
	};

	const handleClickOutside = (e: PointerEvent) => {
		if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
			setIsOpen(false);
			setActiveIndex(-1);
		}
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (!isOpen()) {
			if (e.key === "ArrowDown" || e.key === "Enter") {
				e.preventDefault();
				setIsOpen(true);
				setActiveIndex(0);
			}
			return;
		}

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setActiveIndex((prev) =>
					Math.min(prev + 1, filteredItems().length - 1),
				);
				break;
			case "ArrowUp":
				e.preventDefault();
				setActiveIndex((prev) => Math.max(prev - 1, 0));
				break;
			case "Enter":
				e.preventDefault();
				if (activeIndex() >= 0) {
					handleSelect(filteredItems()[activeIndex()]);
				}
				break;
			case "Escape":
				e.preventDefault();
				setIsOpen(false);
				setActiveIndex(-1);
				break;
		}

		// Scroll active item into view
		if (listRef && activeIndex() >= 0) {
			const activeItem = listRef.children[activeIndex()];
			if (activeItem) {
				activeItem.scrollIntoView({
					block: "nearest",
				});
			}
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
			class="group drop-down pointer-events-auto relative h-fit"
			role="combobox"
			aria-expanded={isOpen()}
			aria-haspopup="listbox"
			aria-controls="dropdown-list"
			style={style}
		>
			<input
				type="text"
				value={query()}
				oninput={handleChange}
				onClick={() => setIsOpen(!isOpen())}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				spellcheck="false"
				readonly={readonly}
				aria-autocomplete="list"
				aria-controls="dropdown-list"
				aria-activedescendant={
					activeIndex() >= 0
						? `dropdown-item-${activeIndex()}`
						: undefined
				}
				class="ease border-secondary-20 text-secondary-70 placeholder:text-secondary-40 hover:border-secondary-70 focus:border-primary bg-secondary-10/75 h-fit w-full max-w-full cursor-pointer appearance-none rounded-md py-2 pr-20 pl-3 text-xs shadow-sm focus:shadow disabled:cursor-not-allowed disabled:opacity-50"
				// classList={{
				// 	"cursor-pointer": readonly,
				// }}
			/>
			<Show when={isOpen()}>
				<ul
					ref={listRef}
					id="dropdown-list"
					class="bg-secondary-10 border-secondary absolute z-50 mt-2 max-h-40 overflow-x-hidden overflow-y-auto rounded-md p-1 text-sm shadow-lg"
					role="listbox"
					style={{
						// ...calculateDropdownPosition(),
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
									classList={{
										"bg-secondary-10":
											index() === activeIndex(),
									}}
									role="option"
									aria-selected={index() === activeIndex()}
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
