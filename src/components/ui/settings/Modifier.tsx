import { KeyIcon } from "lucide-solid";
import { createSignal, Show } from "solid-js";

export default function Modifier() {
        const [key, setKey] = createSignal("");
        const [value, setValue] = createSignal("");
        const [error, setError] = createSignal("");

        const handleKeyChange = (
                e: Event & { currentTarget: HTMLInputElement },
        ) => {
                const newKey = e.currentTarget.value;
                setKey(newKey);

                if (newKey) {
                        try {
                                const storedValue =
                                        localStorage.getItem(newKey);
                                if (storedValue) {
                                        const parsed = JSON.parse(storedValue);
                                        setValue(
                                                JSON.stringify(parsed, null, 2),
                                        );
                                        setError("");
                                } else {
                                        setValue("");
                                        setError("No value found for this key");
                                }
                        } catch (err) {
                                const storedValue =
                                        localStorage.getItem(newKey) || "";
                                setError("Invalid JSON in localStorage");
                                setValue(storedValue);
                        }
                } else {
                        setValue("");
                        setError("");
                }
        };

        const handleSave = () => {
                if (!key()) {
                        setError("Please enter a key");
                        return;
                }

                try {
                        const parsed = JSON.parse(value());
                        localStorage.setItem(key(), JSON.stringify(parsed));
                        setError("");
                } catch (err) {
                        setError("Invalid JSON format");
                }
        };

        return (
                <div class="flex h-full w-full flex-col gap-2 p-10">
                        <div class="flex-1 overflow-hidden">
                                <div class="flex h-full flex-col space-y-2 text-neutral-700 dark:text-neutral-200">
                                        <div class="flex flex-col gap-3">
                                                <div>
                                                        <label
                                                                for="key"
                                                                class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50"
                                                        >
                                                                Modifier
                                                        </label>
                                                        <p class="text-sm text-neutral-600 dark:text-neutral-400">
                                                                Manually modify
                                                                the local
                                                                storage of any
                                                                realm.
                                                        </p>
                                                </div>
                                                <div class="relative">
                                                        <input
                                                                id="key"
                                                                type="text"
                                                                value={key()}
                                                                onInput={
                                                                        handleKeyChange
                                                                }
                                                                class="input"
                                                                style={{
                                                                        "--padding-y":
                                                                                "calc(var(--spacing) * 2)",
                                                                        "--padding-x":
                                                                                "calc(var(--spacing) * 10) calc(var(--spacing) * 2)",
                                                                        "--bg-color":
                                                                                "var(--secondary-color-10)",
                                                                        "--bg-color-f":
                                                                                "var(--secondary-color-15)",
                                                                }}
                                                                placeholder="Enter localStorage key"
                                                        />
                                                        <KeyIcon class="absolute top-3 left-3 size-5" />
                                                </div>
                                        </div>

                                        <Show when={key()}>
                                                <div class="flex flex-1 flex-col space-y-2">
                                                        <div class="flex items-center justify-between">
                                                                <label
                                                                        for="value"
                                                                        class="block text-sm font-medium text-neutral-700 dark:text-neutral-200"
                                                                >
                                                                        Value
                                                                        (JSON)
                                                                </label>
                                                                <span class="text-xs text-neutral-500 dark:text-neutral-400">
                                                                        Press
                                                                        Ctrl+Enter
                                                                        to
                                                                        format
                                                                </span>
                                                        </div>
                                                        <div class="relative flex-1">
                                                                <textarea
                                                                        id="value"
                                                                        value={value()}
                                                                        onInput={(
                                                                                e,
                                                                        ) =>
                                                                                setValue(
                                                                                        e
                                                                                                .currentTarget
                                                                                                .value,
                                                                                )
                                                                        }
                                                                        class="input h-full w-full resize-none font-mono text-sm text-neutral-900"
                                                                        style={{
                                                                                "--padding-y":
                                                                                        "calc(var(--spacing) * 2)",
                                                                                "--padding-x":
                                                                                        "calc(var(--spacing) * 10) calc(var(--spacing) * 2)",
                                                                        }}
                                                                        placeholder="Enter JSON value"
                                                                />
                                                        </div>
                                                </div>
                                        </Show>

                                        <Show when={error()}>
                                                <div class="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                                        <p class="text-sm text-red-600 dark:text-red-400">
                                                                {error()}
                                                        </p>
                                                </div>
                                        </Show>
                                </div>
                        </div>

                        <button
                                onClick={handleSave}
                                class="button-primary w-full"
                        >
                                Save Changes
                        </button>
                </div>
        );
}
