import { XIcon } from "lucide-solid";
import { createSignal, For } from "solid-js";

type Props = {
	words: string[];
	setWords: (ls: string[]) => void;
	placeholder?: string;
};

export default function WordInput(props: Props) {
	let inpt!: HTMLInputElement;
	const [keywords, setKeywords] = createSignal(props.words ?? []);

	return (
		<div
			class="group border-secondary-10 bg-secondary-05 relative flex min-h-[2.5rem] w-full flex-wrap gap-1.5 rounded-md border-1 px-2 py-2 text-sm shadow-sm"
			onclick={() => inpt.focus()}
		>
			<For each={keywords()}>
				{(tag: string) => (
					<span class="border-secondary-15 bg-secondary-10 inline-flex h-fit items-center gap-1 rounded-md border-1 px-2 py-0.5 text-xs font-medium">
						{tag}
						<button
							type="button"
							class="hover:bg-secondary-20 ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-xs"
							onclick={(e) => {
								e.stopPropagation();
								const newKeywords = keywords().filter(
									(i) => i !== tag,
								);
								setKeywords(newKeywords);
								props.setWords(newKeywords);
							}}
						>
							<XIcon class="h-3 w-3" />
						</button>
					</span>
				)}
			</For>
			<input
				ref={inpt}
				placeholder={props.placeholder ?? "Add item..."}
				class="h-fit min-w-[120px] flex-1 bg-transparent py-0.5 text-sm outline-none focus:outline-none"
				onkeydown={(e) => {
					if (
						(e.key === "Enter" || e.key === ",") &&
						e.currentTarget.value !== "" &&
						!keywords().includes(e.currentTarget.value.trim())
					) {
						e.preventDefault();
						const newKeywords = [
							...keywords(),
							e.currentTarget.value.trim(),
						];
						setKeywords(newKeywords);
						props.setWords(newKeywords);
						e.currentTarget.value = "";
					} else if (
						e.key === "Backspace" &&
						e.currentTarget.value === "" &&
						keywords().length > 0
					) {
						const newKeywords = keywords().slice(0, -1);
						setKeywords(newKeywords);
						props.setWords(newKeywords);
					}
				}}
			/>
			<span class="text-secondary-25 absolute right-0.5 bottom-0.5 text-xs">
				press <span class="keyboard-button text-[0.7em]">Enter</span> to
				add
			</span>
		</div>
	);
}
