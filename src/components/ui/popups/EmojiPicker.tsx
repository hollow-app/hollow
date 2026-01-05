import EmojiIcon from "@assets/icons/mood-smile.svg";
import { createResource, createSignal, For, Show } from "solid-js";
import { SearchIcon } from "lucide-solid";
import PopupWrapper from "../../ui/PopupWrapper";
import { hollow } from "hollow";

type EmojiPickerProps = {
	p: { emoji: string; setEmoji: (e: string) => void };
};
export default function EmojiPicker({ p }: EmojiPickerProps) {
	const [miEmoji, setMiEmoji] = createSignal(p.emoji);
	const [search, setSearch] = createSignal("");

	const [emojiData] = createResource(async () => {
		const module = await import("emojibase-data/en/compact.json");
		return module.default;
	});

	const onSave = () => {
		p.setEmoji(miEmoji());
		hollow.events.emit("emoji-picker", null);
	};
	const onCancel = () => {
		p.setEmoji(p.emoji);
		hollow.events.emit("emoji-picker", null);
	};
	return (
		<PopupWrapper Icon={EmojiIcon} title="Emoji Picker">
			<div class="emoji-picker flex flex-col gap-3 px-5 pb-5">
				<div class="flex w-full gap-2">
					<div class="bg-secondary-10/70 flex items-center rounded">
						<span class="flex size-12 shrink-0 items-center justify-center text-center text-2xl">
							{miEmoji()}
						</span>
					</div>
					<div class="relative flex-1">
						<input
							class="input bg-secondary-10/70 peer focus:bg-secondary-10 h-fit w-full text-sm transition-all duration-200"
							style={{
								"--border-w": "0px",
								"--padding-y": "calc(var(--spacing) * 3.5)",
								"--padding-x":
									"calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
								"--bg-color": "var(--color-secondary-10)",
							}}
							placeholder="Search emojis..."
							oninput={(e) => setSearch(e.currentTarget.value)}
						/>
						<SearchIcon class="text-secondary-30 peer-focus:text-secondary-90 absolute top-1/2 left-3 w-5 -translate-y-1/2 transition-colors" />
					</div>
				</div>
				<Show
					when={emojiData()}
					fallback={
						<div class="flex h-80 w-100 items-center justify-center">
							<div class="chaotic-orbit" />
						</div>
					}
				>
					{(data) => (
						<div class="border-secondary-20 border-t border-b border-dashed">
							<div class="flex h-80 w-100 flex-wrap justify-center gap-1 overflow-hidden overflow-y-scroll p-1">
								<For
									each={data()
										.slice(26)
										.filter((i) =>
											i.tags.some((tag) =>
												tag.includes(search()),
											),
										)
										.map((i) => i.unicode)}
								>
									{(i) => (
										<span
											class="hover:bg-secondary-15 size-fit cursor-pointer rounded p-1 text-3xl"
											onclick={() => setMiEmoji(i)}
										>
											{i}
										</span>
									)}
								</For>
							</div>
						</div>
					)}
				</Show>

				<div class="flex w-full justify-around gap-3">
					<button
						onclick={onSave}
						class="button primary"
						style={{ "--w": "100%" }}
					>
						Save
					</button>
					<button
						onclick={onCancel}
						class="button secondary"
						style={{ "--w": "100%" }}
					>
						Cancel
					</button>
				</div>
			</div>
		</PopupWrapper>
	);
}
