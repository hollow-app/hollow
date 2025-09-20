import { createResource, createSignal, For, Show } from "solid-js";
import { SearchIcon } from "lucide-solid";

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
                window.hollowManager.emit("EmojiPicker", null);
        };
        const onCancel = () => {
                p.setEmoji(p.emoji);
                window.hollowManager.emit("EmojiPicker", null);
        };
        return (
                <div class="bg-secondary-05 border-secondary-15 shadow-popup pointer-events-auto absolute flex h-fit w-fit flex-col items-center gap-5 rounded-xl border-1 p-6">
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
                                                        "--padding-y":
                                                                "calc(var(--spacing) * 3.5)",
                                                        "--padding-x":
                                                                "calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
                                                        "--bg-color":
                                                                "var(--color-secondary-10)",
                                                }}
                                                placeholder="Search emojis..."
                                                oninput={(e) =>
                                                        setSearch(
                                                                e.currentTarget
                                                                        .value,
                                                        )
                                                }
                                        />
                                        <SearchIcon class="text-secondary-30 peer-focus:text-secondary-90 absolute top-1/2 left-3 w-5 -translate-y-1/2 transition-colors" />
                                </div>
                        </div>
                        <Show
                                when={emojiData()}
                                fallback={
                                        <div class="flex h-70 w-90 items-center justify-center">
                                                <div class="chaotic-orbit" />
                                        </div>
                                }
                        >
                                {(data) => (
                                        <div class="border-secondary-20 border-t border-b border-dashed py-2">
                                                <div class="mask-image-fade flex h-70 w-90 flex-wrap justify-center gap-1 overflow-hidden overflow-y-scroll p-1">
                                                        <For
                                                                each={data()
                                                                        .slice(
                                                                                26,
                                                                        )
                                                                        .filter(
                                                                                (
                                                                                        i,
                                                                                ) =>
                                                                                        i.tags.some(
                                                                                                (
                                                                                                        tag,
                                                                                                ) =>
                                                                                                        tag.includes(
                                                                                                                search(),
                                                                                                        ),
                                                                                        ),
                                                                        ) // search filter
                                                                        .map(
                                                                                (
                                                                                        i,
                                                                                ) =>
                                                                                        i.unicode,
                                                                        )}
                                                        >
                                                                {(i) => (
                                                                        <span
                                                                                class="hover:bg-secondary-15 size-fit cursor-pointer rounded p-1 text-3xl"
                                                                                onclick={() =>
                                                                                        setMiEmoji(
                                                                                                i,
                                                                                        )
                                                                                }
                                                                        >
                                                                                {
                                                                                        i
                                                                                }
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
                                        class="button-primary w-full"
                                >
                                        Save
                                </button>
                                <button
                                        onclick={onCancel}
                                        class="button-secondary w-full"
                                >
                                        Cancel
                                </button>
                        </div>
                </div>
        );
}
