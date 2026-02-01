import { createMemo, createSignal, For } from "solid-js";

type SliderProps = {
	value: number;
	setValue: (n: number) => void;
	min?: number;
	max?: number;
};
export function Slider({
	value = 0,
	setValue,
	min = 0,
	max = 100,
}: SliderProps) {
	const [myValue, setMyValue] = createSignal<number>(value);
	let spn!: HTMLSpanElement;
	const [left, setLeft] = createSignal<number>(0);

	const handleRangeChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		setMyValue(Number(target.value));
	};

	return (
		<div
			class={`slider-wrap group pointer-events-auto relative w-70 pb-[16px]`}
			onmousemove={(e) => {
				setLeft(
					e.clientX -
						e.currentTarget.getBoundingClientRect().left -
						spn.getBoundingClientRect().width / 2,
				);
			}}
		>
			<span
				ref={spn}
				class="bg-secondary-10 border-secondary-15 text-secondary-50 absolute bottom-8 h-fit rounded border-0 px-1 text-center text-xs opacity-0 transition-opacity group-active:opacity-100"
				style={{ left: `${left()}px` }}
			>
				{myValue()}
			</span>
			<input
				type="range"
				min={min}
				max={max}
				value={myValue()}
				onmouseup={() => setValue(myValue())}
				class="slider-range rounded-xl outline-none"
				onInput={handleRangeChange}
				onMouseMove={handleRangeChange}
				style={{
					background: `linear-gradient(to right, var(--primary-color-05) 0%, var(--primary-color-05)  ${myValue()}%, var(--color-secondary-10) ${myValue()}%, var(--color-secondary-10) 100%)`,
				}}
			/>
		</div>
	);
}
