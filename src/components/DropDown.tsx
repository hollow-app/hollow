import { ArrowDownUpIcon } from "lucide-solid";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";

type DropDownProps = {
	value?: string;
	items: string[];
	onSelect: (v: string) => void;
	placeholder?: string;
	isLoading?: boolean;
	error?: string;
	editable?: boolean;
};

export default function DropDown({
	value,
	items,
	onSelect,
	placeholder,
	isLoading = false,
	error,
	editable = true,
}: DropDownProps) {
	const [query, setQuery] = createSignal(value || "");
	const [isOpen, setIsOpen] = createSignal(false);
	const [filteredItems, setFilteredItems] = createSignal<string[]>(items);
	const [activeIndex, setActiveIndex] = createSignal(-1);
	let dropdownRef: HTMLDivElement | undefined;
	let inputRef: HTMLInputElement | undefined;
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

	const calculateDropdownPosition = () => {
		if (!inputRef || !listRef) return {};
		const inputRect = inputRef.getBoundingClientRect();
		const dropdownRect = listRef.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		// Check if dropdown would go below viewport
		const spaceBelow = viewportHeight - inputRect.bottom;
		const spaceAbove = inputRect.top;
		const dropdownHeight = dropdownRect.height;

		if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
			// Position above input
			return {
				bottom: `${window.innerHeight - inputRect.top + 5}px`,
				left: `${inputRect.left}px`,
			};
		}

		// Position below input
		return {
			top: `${inputRect.bottom + 5}px`,
			left: `${inputRect.left}px`,
		};
	};

	return (
		<div
			ref={dropdownRef}
			class="group pointer-events-auto relative w-70 h-fit"
			role="combobox"
			aria-expanded={isOpen()}
			aria-haspopup="listbox"
			aria-controls="dropdown-list"
		>
			<input
				ref={inputRef}
				type="text"
				value={query()}
				oninput={handleChange}
				onClick={() => setIsOpen(!isOpen())}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				spellcheck="false"
				readonly={!editable}
				aria-autocomplete="list"
				aria-controls="dropdown-list"
				aria-activedescendant={
					activeIndex() >= 0
						? `dropdown-item-${activeIndex()}`
						: undefined
				}
				class="ease h-10 border-secondary-20 text-secondary-70 placeholder:text-secondary-40 hover:border-secondary-70 focus:border-primary w-full max-w-full appearance-none rounded-md bg-secondary-10/75 py-2 pr-20 pl-3 text-sm shadow-sm  focus:shadow disabled:cursor-not-allowed disabled:opacity-50"
				disabled={isLoading}
				classList={{
					"border-red-500": !!error,
					"cursor-pointer": !editable,
				}}
			/>
			{error && (
				<p class="mt-1 text-xs text-red-500" role="alert">
					{error}
				</p>
			)}
			<Show
				when={isOpen() && !isLoading}
				fallback={
					isLoading && (
						<div class="absolute top-1/2 right-10 -translate-y-1/2">
							<div class="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
						</div>
					)
				}
			>
				<ul
					ref={listRef}
					id="dropdown-list"
					class="bg-secondary-10 p-2 border-secondary fixed z-50  w-70 overflow-x-hidden overflow-y-auto rounded-md text-sm shadow-lg"
					role="listbox"
					style={calculateDropdownPosition()}
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
									class="hover:bg-primary/10 rounded text-secondary-60 hover:text-primary w-full cursor-pointer bg-transparent px-3 py-2"
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
			<ArrowDownUpIcon
				class="pointer-events-none absolute top-0 right-3 h-full transition duration-300"
				classList={{
					"text-secondary-20": !isOpen(),
					"text-primary": isOpen(),
				}}
				aria-hidden="true"
			/>
		</div>
	);
}
