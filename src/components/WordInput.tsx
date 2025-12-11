import { CornerDownLeftIcon, XIcon } from "lucide-solid";
import { createSignal, For } from "solid-js";

type TagInputProps = {
	words: () => string[];
	setWords: (ls: string[]) => void;
	placeholder?: string;
};
export default function WordInput({
	words,
	setWords,
	placeholder,
}: TagInputProps) {
	let inpt!: HTMLInputElement;
	const [keywords, setKeywords] = createSignal(words() ?? []);
	return (
		<div
			class="border-secondary-10 group bg-secondary-05 relative flex max-h-full w-full flex-wrap gap-1 overflow-hidden overflow-y-visible rounded border-1 p-3 text-[1.2em] text-gray-900 dark:text-gray-50"
			onclick={() => inpt.focus()}
		>
			<For each={keywords()}>
				{(tag: string) => (
					<span
						class="bg-secondary-10 border-secondary-15 flex h-fit w-fit items-center gap-1 rounded border-1 pl-1 text-sm"
						style={{ "line-height": 1 }}
					>
						{tag}
						<XIcon
							class="bg-secondary-15 border-secondary-10 hover:bg-secondary-20 h-4 w-4 cursor-pointer rounded border-1 p-px"
							onclick={(e) => {
								setKeywords([
									...keywords().filter((i) => i !== tag),
								]);
								setWords(keywords());
							}}
						/>
					</span>
				)}
			</For>
			<input
				ref={inpt}
				style={{
					"line-height": 1,
				}}
				placeholder={placeholder ?? "..."}
				class="h-fit w-fit text-sm"
				onkeydown={(e) => {
					if (
						e.key === "Enter" &&
						e.currentTarget.value !== "" &&
						!keywords().includes(e.currentTarget.value)
					) {
						e.preventDefault();
						setKeywords([
							...keywords(),
							e.currentTarget.value.trim(),
						]);
						setWords(keywords());
						e.currentTarget.value = "";
					} else if (
						e.key === "Backspace" &&
						e.currentTarget.value === "" &&
						keywords().length > 0
					) {
						setKeywords([...keywords().slice(0, -1)]);
						setWords(keywords());
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
