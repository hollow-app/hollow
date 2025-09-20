import { ListFilterPlusIcon } from "lucide-solid";
import { space } from "postcss/lib/list";
import { createSignal, For, Setter } from "solid-js";
import DropDown from "./DropDown";

type FilterButtonProps = {
        tools: string[];
        tags: string[];
        filter: () => { tool: string; tags: string[] };
        setFilter: Setter<{ tool: string; tags: string[]; text: string }>;
};
export default function FilterButton({
        tools,
        tags,
        filter,
        setFilter,
}: FilterButtonProps) {
        const [isVisi, setVisi] = createSignal(false);
        const selectTag = (tag: string) => {
                setFilter((prev) => ({
                        ...prev,
                        tags: prev.tags.includes(tag)
                                ? [...prev.tags.filter((i) => i !== tag)]
                                : [...prev.tags, tag],
                }));
        };
        const selectTool = (t: string) => {
                setFilter((prev) => ({
                        ...prev,
                        tool: t === "All" ? null : t,
                }));
        };
        const clearAll = () => {
                setFilter((prev) => ({ ...prev, tags: [], tool: null }));
        };
        return (
                <div class="relative flex flex-col items-center">
                        <button
                                class="button-control flex items-center gap-2 px-2 py-2"
                                onclick={() => setVisi(!isVisi())}
                        >
                                <ListFilterPlusIcon class="text-secondary-50" />
                        </button>
                        <div
                                class="bg-secondary-05 border-secondary-10 absolute mt-12 flex max-h-90 w-65 flex-col gap-2 rounded border-1 p-4 shadow-[0_0_5px_5px_rgba(0,0,0,0.25)] dark:shadow-[0_0_10px_5px_rgba(0,0,0,0.6)]"
                                classList={{ hidden: !isVisi() }}
                        >
                                <p class="text-sm font-bold">Tool</p>
                                <DropDown
                                        items={["All", ...tools]}
                                        onSelect={selectTool}
                                        value={filter().tool ?? "All"}
                                />
                                <p class="text-sm font-bold">Tags</p>
                                <div class="overflow-hidden overflow-y-scroll text-sm">
                                        <For each={tags}>
                                                {(tag) => (
                                                        <div class="flex items-center gap-1">
                                                                <input
                                                                        type={
                                                                                "checkbox"
                                                                        }
                                                                        checked={filter().tags.includes(
                                                                                tag,
                                                                        )}
                                                                        onChange={() =>
                                                                                selectTag(
                                                                                        tag,
                                                                                )
                                                                        }
                                                                />
                                                                <span>
                                                                        {tag}
                                                                </span>
                                                        </div>
                                                )}
                                        </For>
                                </div>
                                <button
                                        class="button-secondary"
                                        onclick={clearAll}
                                >
                                        Clear All
                                </button>
                        </div>
                </div>
        );
}
