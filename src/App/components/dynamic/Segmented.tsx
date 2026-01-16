import { DynamicIcon } from "@components/ui/DynamicIcon";
import {
	createMemo,
	createSelector,
	createSignal,
	For,
	onMount,
	Show,
} from "solid-js";

interface Props {
	value: any;
	setValue: (v: any) => void;
	options: { key: any; title?: string; icon?: any }[];
	direct?: boolean;
}

export default function Segmented(props: Props) {
	let parent!: HTMLDivElement;
	const itemsRect: Record<string, { width: string; left: string }> = {};
	const [value, setValue] = createSignal(null);
	const isSelected = createSelector(props.direct ? () => props.value : value);
	const position = createMemo(() => {
		if (!value()) {
			return {
				left: "0px",
				width: "100%",
			};
		}
		return itemsRect[props.direct ? props.value : value()];
	});
	let space = 0;
	const onSelect = (v: any) => {
		setValue(v);
		props.setValue(v);
	};
	onMount(() => {
		const parentLeft = parent.getBoundingClientRect().left;
		const childLeft = parent.children[1].getBoundingClientRect().left;
		space = childLeft - parentLeft;
		for (const el of parent.children) {
			const key = el.getAttribute("data-key");
			if (key) {
				itemsRect[key] = {
					width: el.scrollWidth + 2 * space + "px",
					left: el.getBoundingClientRect().left - parentLeft + "px",
				};
			}
		}
		setValue(props.value ?? props.options[0].key);
	});
	return (
		<div class="bg-secondary-05 w-full rounded-lg p-1">
			<div
				ref={parent}
				class="relative flex w-full items-center justify-around gap-5 p-1.5"
			>
				<div
					class="bg-secondary absolute h-full rounded-lg shadow transition-all"
					style={position()}
				/>
				<For each={props.options}>
					{(option) => (
						<button
							class="z-1 flex h-full w-full items-center justify-center gap-1 font-medium outline-none"
							type="button"
							classList={{
								"text-primary ": isSelected(option.key),
								"text-secondary-40 ": !isSelected(option.key),
							}}
							onclick={() => onSelect(option.key)}
							data-key={option.key}
						>
							<Show when={option.icon}>
								<DynamicIcon
									icon={option.icon}
									class="size-5"
								/>
							</Show>
							{option.title}
						</button>
					)}
				</For>
			</div>
		</div>
	);
}
