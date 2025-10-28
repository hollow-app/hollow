import { ListFilterPlusIcon } from "lucide-solid";
import {
	createSignal,
	For,
	Show,
	onCleanup,
	Switch,
	Match,
	createEffect,
} from "solid-js";
import DropDown from "./DropDown";

type ConfigItem = {
	id: string;
	label: string;
	options: string[];
};
type DropdownConfig = ConfigItem & {
	type: "dropdown";
	placeholder?: string;
	onSelect: (value: string) => void;
};

type MultiOptionConfig = ConfigItem & {
	type: "multioption";
	initials?: number[];
	onChange: (values: string[]) => void;
};

type FilterConfig = DropdownConfig | MultiOptionConfig;

interface FilterButtonProps {
	label?: string;
	configs: FilterConfig[];
}

export default function FilterButton(props: FilterButtonProps) {
	const [open, setOpen] = createSignal(false);
	const [selectedValues, setSelectedValues] = createSignal<
		{ id: string; values: string[] }[]
	>(
		props.configs
			.filter((i) => i.type === "multioption")
			.map((i) => ({
				id: i.id,
				values: i.initials?.map((j) => i.options[j]) ?? [],
			})),
	);

	const handleClickOutside = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (!target.closest(".filter-button-wrapper")) {
			setOpen(false);
		}
	};

	const onClear = () => {
		setSelectedValues(
			props.configs
				.filter((i) => i.type === "multioption")
				.map((i) => ({ id: i.id, values: [] })),
		);
		props.configs.forEach((config) => {
			if (config.type === "dropdown") {
				config.onSelect("");
			} else if (config.type === "multioption") {
				config.onChange([]);
			}
		});
	};

	const toggleValue = (id: string, value: string) => {
		let newValues: string[];
		const config = selectedValues().find((i) => i.id === id);
		if (config.values.includes(value)) {
			newValues = config.values.filter((v) => v !== value);
		} else {
			newValues = [...config.values, value];
		}
		setSelectedValues((prev) =>
			prev.map((i) => (i.id === id ? { ...i, values: newValues } : i)),
		);
		(props.configs.find((i) => i.id === id) as MultiOptionConfig).onChange(
			newValues,
		);
	};

	createEffect(() => {
		if (open()) {
			document.addEventListener("click", handleClickOutside);
		} else {
			document.removeEventListener("click", handleClickOutside);
		}
	});

	onCleanup(() => document.removeEventListener("click", handleClickOutside));

	return (
		<div class="filter-button-wrapper relative inline-block">
			<button
				type="button"
				class="flex items-center gap-1"
				classList={{
					"button-secondary": !!props.label,
					"button-control": !props.label,
				}}
				style={{
					"--padding-x": "calc(var(--spacing) * 2)",
				}}
				onClick={() => setOpen((o) => !o)}
			>
				<ListFilterPlusIcon class="size-5" />
				{props.label}
			</button>

			<Show when={open()}>
				<div class="bg-secondary-05 border-secondary-10 absolute z-10 mt-2 min-w-[15rem] rounded-lg border pb-2 shadow-xl">
					<div class="flex items-center justify-between px-4 py-2">
						<p class="text-lg font-medium text-neutral-500">
							Filter
						</p>
						<button
							class="button-secondary group"
							style={{
								"--padding-x": "calc(var(--spacing) * 2)",
								"--padding-y": "calc(var(--spacing) * 1)",
							}}
							onclick={onClear}
						>
							Clear
						</button>
					</div>
					<hr class="border-secondary bg-secondary-10 mx-auto my-0.5 h-[2px] w-full" />
					<For each={props.configs}>
						{(config) => (
							<Show when={config.options.length > 0}>
								<div class="px-4 py-2">
									<p class="text-sm text-neutral-700 dark:text-neutral-400">
										{config.label}
									</p>
									<Switch>
										<Match
											when={config.type === "dropdown"}
										>
											<DropDown
												options={() => [
													{
														items: config.options.map(
															(i) => ({
																label: i,
															}),
														),
														onSelect: (
															v: string,
														) => {
															setOpen(false);
															(
																config as DropdownConfig
															).onSelect(v);
														},
													},
												]}
												placeholder={
													(config as DropdownConfig)
														.placeholder
												}
												style={{
													"--w": "calc(var(--spacing) * 60)",
												}}
											/>
										</Match>

										<Match
											when={config.type === "multioption"}
										>
											<div class="h-fit max-h-40 overflow-hidden overflow-y-auto">
												<For
													each={
														(
															config as MultiOptionConfig
														).options
													}
												>
													{(option) => (
														<label class="hover:bg-secondary-10 flex cursor-pointer items-center space-x-2 rounded px-2 py-1">
															<input
																type="checkbox"
																class="checkbox"
																checked={selectedValues()
																	.find(
																		(i) =>
																			i.id ===
																			config.id,
																	)
																	.values.includes(
																		option,
																	)}
																onInput={() =>
																	toggleValue(
																		config.id,
																		option,
																	)
																}
															/>
															<span class="text-xs">
																{option}
															</span>
														</label>
													)}
												</For>
											</div>
										</Match>
									</Switch>
								</div>
							</Show>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
}
