import { DynamicIcon } from "@components/DynamicIcon";
import { options } from "marked";
import { readableColor } from "polished";
import { createSelector, createSignal, For, onMount, Show } from "solid-js";

interface Props {
	value: any;
	setValue: (v: any) => void;
	options: { key: any; title?: string; icon?: any }[];
}

export default function Segmented(props: Props) {
	let parent!: HTMLDivElement;
	const [position, setPosition] = createSignal({
		left: "0px",
		width: "100%",
	});
	const [value, setValue] = createSignal(props.value ?? props.options[0].key);
	const isSelected = createSelector(value);

	let space = 0;

	const detectPosition = (e: HTMLButtonElement) => {
		setPosition({
			width: `${e.scrollWidth + 2 * space}px`,
			left: `${e.offsetLeft - space}px`,
		});
	};

	const onSelect = (
		v: any,
		e: MouseEvent & { currentTarget: HTMLButtonElement },
	) => {
		detectPosition(e.currentTarget);
		setValue(v);
		props.setValue(v);
	};

	onMount(() => {
		const parentLeft = parent.getBoundingClientRect().left;
		const childLeft = parent.children[1].getBoundingClientRect().left;
		space = childLeft - parentLeft;
		const child =
			parent.children[
				(props.value
					? props.options.findIndex((i) => i.key === props.value)
					: 0) + 1
			];
		setPosition({
			width: `${child.scrollWidth + 2 * space}px`,
			left: `${child.getBoundingClientRect().left - parent.getBoundingClientRect().left - space}px`,
		});
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
							onclick={(e) => onSelect(option.key, e)}
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
