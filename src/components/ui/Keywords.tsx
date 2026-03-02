import { For, createSignal, splitProps, Show } from "solid-js";
import { XIcon } from "lucide-solid";
import { Tag } from "./Tag";

type KeywordsProps = {
    value: string[];
    onselect: (items: string[]) => void;
    placeholder?: string;
    class?: string;
    w?: string;
};

export function Keywords(props: KeywordsProps) {
    const [local, rest] = splitProps(props, [
        "value",
        "onselect",
        "placeholder",
        "class",
        "w",
    ]);
    const [inputValue, setInputValue] = createSignal("");

    const handleAdd = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (local.value.includes(trimmed)) {
            setInputValue("");
            return;
        }
        local.onselect([...local.value, trimmed]);
        setInputValue("");
    };

    const handleRemove = (tag: string) => {
        local.onselect(local.value.filter((i) => i !== tag));
    };

    let inpt!: HTMLInputElement;

    return (
        <div
            onclick={() => inpt.focus()}
            class={`group border-secondary-10 bg-secondary-05 relative flex flex-wrap gap-1.5 rounded-md border px-2.5 py-1.5 text-sm shadow-sm transition-colors focus-within:border-primary/50 ${local.class ?? ""} ${local.w ?? "w-full"}`}
        >
            <For each={local.value}>
                {(item) => (
                    <span class="bg-secondary-10 border-secondary-15 animate-in fade-in zoom-in inline-flex h-6 items-center gap-1 rounded px-2 py-0.5 text-xs font-medium">
                        {item}
                        <button
                            type="button"
                            class="hover:text-red-500 transition-colors"
                            onclick={(e) => {
                                e.stopPropagation();
                                handleRemove(item);
                            }}
                        >
                            <XIcon class="h-3.5 w-3.5" />
                        </button>
                    </span>
                )}
            </For>
            <input
                ref={inpt!}
                type="text"
                value={inputValue()}
                onInput={(e) => setInputValue(e.currentTarget.value)}
                placeholder={local.value.length === 0 ? (local.placeholder ?? "Add keywords...") : ""}
                class="placeholder:text-secondary-40 min-w-[120px] flex-1 cursor-text bg-transparent text-neutral-950 outline-none dark:text-neutral-50"
                onkeydown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdd(inputValue());
                    } else if (e.key === "," || e.key === " ") {
                        if (inputValue().trim()) {
                            e.preventDefault();
                            handleAdd(inputValue());
                        }
                    } else if (e.key === "Backspace" && !inputValue() && local.value.length > 0) {
                        handleRemove(local.value[local.value.length - 1]);
                    }
                }}
            />
        </div>
    );
}
