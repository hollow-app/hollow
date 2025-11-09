import { createEffect, createSignal, on, Setter } from "solid-js";

type NumberInputProps = {
	value: () => number;
	setValue: (v: number) => void;
	step?: number;
	max?: number;
	min?: number;
	direct?: boolean;
};
export default function NumberInput({
	value,
	setValue,
	step = 1,
	max = 1000,
	min = 0,
	direct,
}: NumberInputProps) {
	const [myValue, setMyValue] = createSignal(value());
	createEffect(() => {
		on(value, (v) => setMyValue(v));
	});
	const minus = () => {
		const n = parseFloat((myValue() - step).toFixed(10));
		if (n >= min) {
			setMyValue(n);
			direct && setValue(n);
		}
	};

	const plus = () => {
		const n = parseFloat((myValue() + step).toFixed(10));
		if (n <= max) {
			setMyValue(n);
			direct && setValue(n);
		}
	};

	const handleInput = (e: Event) => {
		const newValue = Number((e.target as HTMLInputElement).value);
		if (!isNaN(newValue)) {
			setMyValue(newValue);
			direct && setValue(newValue);
		}
	};

	const commitValue = () => {
		if (!direct) {
			setValue(myValue());
		}
	};
	return (
		<div class="relative w-full" onfocusout={commitValue} tabindex={0}>
			<button
				class="hover:bg-secondary-15 active:bg-secondary-20 text-secondary-70 absolute top-1 right-9 rounded-md border border-transparent p-1.5 text-center text-sm transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
				type="button"
				onclick={minus}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4"
				>
					<path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
				</svg>
			</button>
			<input
				type="number"
				value={myValue()}
				oninput={handleInput}
				class="ease border-secondary-20 text-secondary-70 placeholder:text-secondary-40 hover:border-secondary-70 focus:border-primary w-full appearance-none rounded-md border bg-transparent py-2 pr-20 pl-3 text-sm shadow-sm transition duration-300 focus:shadow focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			/>
			<button
				class="hover:bg-secondary-15 active:bg-secondary-20 text-secondary-70 absolute top-1 right-1 rounded-md border border-transparent p-1.5 text-center text-sm transition-all disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
				type="button"
				onclick={plus}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 16 16"
					fill="currentColor"
					class="h-4 w-4"
				>
					<path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
				</svg>
			</button>
		</div>
	);
}
