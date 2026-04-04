import { DynamicIcon } from "@app/components/ui/DynamicIcon";
import {
	createMemo,
	createSelector,
	createSignal,
	For,
	onMount,
	Show,
} from "solid-js";
import { createStore } from "solid-js/store"; // Import store for reactivity

interface Props {
	value: any;
	setValue: (v: any) => void;
	options: { key: any; title?: string; icon?: any }[];
	direct?: boolean;
}

export default function Segmented(props: Props) {
	let parent!: HTMLDivElement;

	// 1. Use a Store so that when we update measurements, the UI reacts
	const [rects, setRects] = createStore<
		Record<string, { width: string; left: string }>
	>({});

	const [internalValue, setInternalValue] = createSignal<any>(null);

	// Determine which value to track
	const activeKey = () => (props.direct ? props.value : internalValue());
	const isSelected = createSelector(activeKey);

	// 2. This memo now tracks both the activeKey AND the rects store
	const position = createMemo(() => {
		const key = activeKey();
		if (!key || !rects[key]) {
			return { left: "0px", width: "0px", opacity: 0 };
		}
		return { ...rects[key], opacity: 1 };
	});

	const onSelect = (v: any) => {
		setInternalValue(v);
		props.setValue(v);
	};

	onMount(() => {
		// 3. Measure all buttons
		const newRects: Record<string, { width: string; left: string }> = {};

		// We look for buttons with data-key inside our ref
		const buttons = parent.querySelectorAll("button[data-key]");
		buttons.forEach((el) => {
			const htmlEl = el as HTMLElement;
			const key = htmlEl.getAttribute("data-key");
			if (key) {
				newRects[key] = {
					width: `${htmlEl.offsetWidth}px`,
					left: `${htmlEl.offsetLeft}px`,
				};
			}
		});

		// 4. Update the store (this triggers the memo)
		setRects(newRects);

		// 5. Set the initial value
		const initial = props.value ?? props.options[0]?.key;
		setInternalValue(initial);
	});

	return (
		<div class="bg-secondary-05 w-full rounded-lg p-0.5">
			<div
				ref={parent}
				class="relative flex w-full items-center gap-2 p-1"
			>
				{/* Floating Indicator */}
				<div
					class="bg-secondary absolute h-[calc(100%-8px)] rounded-md shadow transition-all duration-300 ease-out"
					style={position()}
				/>

				<For each={props.options}>
					{(option) => (
						<button
							class="z-1 flex h-9 flex-1 items-center justify-center gap-1 text-xs font-medium transition-colors outline-none"
							type="button"
							classList={{
								"text-primary": isSelected(option.key),
								"text-secondary-40": !isSelected(option.key),
							}}
							onclick={() => onSelect(option.key)}
							data-key={option.key}
						>
							<Show when={option.icon}>
								<DynamicIcon
									icon={option.icon}
									class="size-4"
								/>
							</Show>
							<span class="text-sm">{option.title}</span>
						</button>
					)}
				</For>
			</div>
		</div>
	);
}
