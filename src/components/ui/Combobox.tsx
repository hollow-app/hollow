import MyIcon, { MyIconsType } from "@app/components/ui/MyIcon";
import Floater from "@app/utils/kinda-junk/Floater";
import { ChevronsUpDownIcon, XIcon } from "lucide-solid";
import { For, splitProps, createSignal, Show, createMemo } from "solid-js";

type GroupedItems = { title: string; items: string[] };

type Props = {
	value?: string;
	items: string[] | GroupedItems[];
	placeholder?: string;
	class?: string;
	readonly?: boolean;
	icon?: MyIconsType;
	w?: string;
	onselect: (item: string) => void;
};

export function Combobox(props: Props) {
	const [local, rest] = splitProps(props, [
		"items",
		"onselect",
		"class",
		"readonly",
		"icon",
		"w",
	]);
	const [isOpen, setIsOpen] = createSignal(false);
	const [selected, setSelected] = createSignal<string>(props.value ?? "");
	const [search, setSearch] = createSignal({
		value: props.value ?? "",
		on: false,
	});

	let inpt!: HTMLInputElement;
	let parentEl!: HTMLDivElement;

	const normalizedItems = createMemo((): GroupedItems[] => {
		if (Array.isArray(local.items) && typeof local.items[0] === "string") {
			return [{ title: "", items: local.items as string[] }];
		}
		return local.items as GroupedItems[];
	});

	const filteredGroups = createMemo(() => {
		const s = local.readonly ? "" : search().value.toLowerCase();
		if (!s || !search().on) return normalizedItems();
		return normalizedItems()
			.map((group) => ({
				...group,
				items: group.items.filter((i) => i.toLowerCase().includes(s)),
			}))
			.filter((group) => group.items.length > 0);
	});

	const handleSelect = (sel: string) => {
		local.onselect(sel);
		setSelected(sel);
	};

	const handleAdd = (value: string) => {
		const trimmed = value.trim();
		if (!trimmed) return;

		handleSelect(trimmed);
		setSearch({ value: trimmed, on: false });
		setIsOpen(false);
	};

	const handleRemove = () => {
		handleSelect("");
		setSearch({ value: "", on: false });
	};

	return (
		<div
			ref={parentEl!}
			tabIndex={0}
			class={`group border-secondary-10 bg-secondary-05 relative flex flex-wrap gap-1.5 rounded-md border px-2.5 py-1.5 text-sm shadow-sm ${local.class ?? ""} ${local.w ?? "w-70"}`}
		>
			<input
				ref={inpt}
				type="text"
				value={search().value}
				readOnly={local.readonly}
				onInput={(e) => {
					setSearch({ value: e.currentTarget.value, on: true });
					setIsOpen(true);
				}}
				onFocus={() => setIsOpen(true)}
				placeholder={props.placeholder}
				class="placeholder:text-secondary-40 w-full cursor-pointer text-neutral-950 outline-none dark:text-neutral-50"
				style={
					local.icon && {
						"padding-inline":
							"calc(var(--spacing) * 7) calc(var(--spacing) * 3)",
					}
				}
				onkeydown={(e) => {
					if (e.key === "Enter" && search().value) {
						e.preventDefault();
						handleAdd(search().value);
					} else if (e.key === "Backspace") {
						if (!search().value) {
							handleSelect("");
						}
					}
				}}
			/>
			<Show when={isOpen()}>
				<Floater
					hide={() => setIsOpen(false)}
					includedEl={parentEl!}
					placement="bottom-start"
				>
					<div
						class="border-secondary-10 popup-shadow overflow-hidden rounded-md border bg-white text-sm dark:bg-neutral-900"
						style={{
							width:
								parentEl?.getBoundingClientRect().width + "px",
						}}
					>
						<div class="scrollbar-hidden max-h-60 overflow-y-auto p-1">
							<For
								each={filteredGroups()}
								fallback={
									<div class="p-2 text-center text-xs text-neutral-500">
										No results found.
									</div>
								}
							>
								{(group) => (
									<div class="">
										<Show when={group.title}>
											<h3 class="text-secondary-50 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase">
												{group.title}
											</h3>
										</Show>
										<ul class="flex flex-col gap-0.5">
											<For each={group.items}>
												{(item) => {
													const isSelected =
														createMemo(
															() =>
																selected() ===
																item,
														);
													return (
														<li
															onClick={() =>
																handleAdd(item)
															}
															class="hover:bg-primary/10 hover:text-primary relative flex w-full cursor-pointer justify-between rounded-md bg-transparent px-3 py-2 text-xs text-neutral-800 dark:text-neutral-300"
															classList={{
																"underline before:content-[''] before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:size-1 before:bg-primary before:rounded-full":
																	isSelected(),
															}}
														>
															{item}
														</li>
													);
												}}
											</For>
										</ul>
									</div>
								)}
							</For>
						</div>
					</div>
				</Floater>
			</Show>
			<Show when={local.icon}>
				<MyIcon
					name={local.icon}
					class="text-secondary-30 peer-focus:text-secondary-50 absolute top-1/2 left-2 size-5 -translate-y-1/2 transition-colors"
				/>
			</Show>
			<Show
				when={!selected()}
				fallback={
					<button
						type="button"
						class="absolute top-0 right-3 h-full hover:text-red-500"
						onclick={(e) => {
							e.stopPropagation();
							handleRemove();
						}}
					>
						<XIcon class="size-4" />
					</button>
				}
			>
				<ChevronsUpDownIcon
					class="text-secondary-40 absolute top-0 right-3 size-4 h-full transition duration-300"
					classList={{ "text-primary": isOpen() }}
				/>
			</Show>
		</div>
	);
}
