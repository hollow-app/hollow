import {
	on,
	createSignal,
	For,
	JSX,
	Show,
	onMount,
	onCleanup,
	createEffect,
} from "solid-js";
import { Portal } from "solid-js/web";
import { ChevronDownIcon } from "lucide-solid";
import { useDropdownPosition } from "../hooks/useDropdownPosition";

export type DropdownProps = {
	value?: () => string;
	options: () => { title?: string; items: string[] }[];
	onSelect: (v: string) => void;
	placeholder?: string;
};

export default function Dropdown({
	value,
	options,
	onSelect,
	placeholder,
}: DropdownProps) {
	const [isOpen, setIsOpen] = createSignal(false);
	const [innerValue, setInnerValue] = createSignal(value ? value() : "");
	let dropdownRef: HTMLDivElement | undefined;
	let listRef: HTMLUListElement | undefined;
	let inputRef: HTMLInputElement | undefined;

	createEffect(() => {
		on(value, (v) => {
			setInnerValue(v);
		});
	});

	const { pos, updatePosition, handleClickOutside } = useDropdownPosition();
	const outsideClick = () => {
		handleClickOutside(dropdownRef, listRef, () => setIsOpen(false));
	};
	const toggleOpen = () => {
		if (!isOpen()) {
			updatePosition(inputRef);
			window.addEventListener("pointerdown", outsideClick);
		} else {
			window.removeEventListener("pointerdown", outsideClick);
		}
		setIsOpen(!isOpen());
	};

	const selectItem = (item: string) => {
		onSelect(item);
		setInnerValue(item);
		setIsOpen(false);
	};

	onMount(() =>
		document.addEventListener("resize", () => updatePosition(inputRef)),
	);
	onCleanup(() =>
		document.removeEventListener("resize", () => updatePosition(inputRef)),
	);

	return (
		<div ref={dropdownRef} class="drop-down relative h-fit">
			<button onClick={toggleOpen} style={{ width: "var(--w)" }}>
				<input
					ref={inputRef}
					type="text"
					value={innerValue()}
					placeholder={placeholder}
					readonly
					class="border-secondary-20 text-secondary-70 placeholder:text-secondary-40 bg-secondary-10/75 text-md relative w-full cursor-pointer rounded-md px-3 py-2 shadow-sm"
				/>
				<ChevronDownIcon
					class="text-secondary-20 absolute top-0 right-1 h-full transition duration-300"
					classList={{ "text-primary": isOpen() }}
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
							width: `${dropdownRef?.getBoundingClientRect().width ?? 200}px`,
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
										<div>
											<For each={group.items}>
												{(item) => (
													<li
														class="hover:bg-primary/10 text-secondary-60 hover:text-primary relative flex w-full cursor-pointer justify-between rounded bg-transparent px-3 py-2 text-xs"
														role="option"
														classList={{
															"underline before:content-[''] before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:size-1 before:bg-primary before:rounded-full":
																innerValue() ===
																item,
														}}
														onClick={() => {
															selectItem(item);
														}}
													>
														{item}
													</li>
												)}
											</For>
										</div>
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
