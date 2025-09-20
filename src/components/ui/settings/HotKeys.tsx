import { hotkeysManager } from "@managers/HotkeysManager";
import { HotKeyType } from "@type/HotKeyType";
import { FeatherIcon } from "lucide-solid";
import { createSignal, For, Show, onMount, onCleanup } from "solid-js";

export default function HotKeys() {
        const [conf, setConf] = createSignal({
                enabled: window.hotkeysManager.isEnabled(),
        });
        const [groups, setGroups] = createSignal<HotKeyType[]>(
                window.hotkeysManager.getHotKeys(),
        );
        const [target, setTarget] = createSignal(null);
        const [currentKeys, setCurrentKeys] = createSignal<string[]>([]);

        const handleEnabled = (
                e: Event & { currentTarget: HTMLInputElement },
        ) => {
                const state = e.currentTarget.checked;
                setConf((prev) => ({ ...prev, enabled: state }));
                window.hotkeysManager.toggle(state);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
                if (target()) {
                        e.preventDefault();
                        const key = e.key.toLowerCase();

                        if (!currentKeys().includes(key)) {
                                setCurrentKeys((prev) => [...prev, key]);
                        }
                }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
                if (target() && currentKeys().length > 0) {
                        const t = target();
                        setGroups((prev: HotKeyType[]) => [
                                ...prev.map((i: HotKeyType) =>
                                        i.name === t
                                                ? {
                                                          ...i,
                                                          keys: [
                                                                  ...currentKeys(),
                                                          ],
                                                  }
                                                : i,
                                ),
                        ]);
                        setCurrentKeys([]);
                        setTarget(null);
                        window.hotkeysManager.setHotKey(
                                groups().find((i) => i.name === target()),
                        );
                }
        };
        const grouped = (
                list: HotKeyType[],
        ): { type: string; items: HotKeyType[] }[] =>
                Object.values(
                        list.reduce(
                                (acc, item) => {
                                        (acc[item.type] ||= {
                                                type: item.type,
                                                items: [],
                                        }).items.push(item);
                                        return acc;
                                },
                                {} as Record<
                                        string,
                                        { type: string; items: HotKeyType[] }
                                >,
                        ),
                );

        onMount(() => {
                window.addEventListener("keydown", handleKeyDown);
                window.addEventListener("keyup", handleKeyUp);
        });

        onCleanup(() => {
                window.removeEventListener("keydown", handleKeyDown);
                window.removeEventListener("keyup", handleKeyUp);
        });

        return (
                <div class="h-fit p-10">
                        <div class="space-y-8">
                                <div class="space-y-3">
                                        <div>
                                                <h1 class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
                                                        Configuration
                                                </h1>
                                        </div>
                                        <div class="flex flex-col gap-5 p-5">
                                                <div class="space-y-3">
                                                        <div class="flex justify-between">
                                                                <div>
                                                                        <h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
                                                                                Enabled
                                                                        </h2>
                                                                        <p class="text-sm text-neutral-600 dark:text-neutral-400">
                                                                                Enable
                                                                                or
                                                                                disable
                                                                                the
                                                                                hotkeys.
                                                                        </p>
                                                                </div>
                                                                <div class="toggle-switch">
                                                                        <input
                                                                                class="toggle-input"
                                                                                id="enable-hotkeys-toggle"
                                                                                type="checkbox"
                                                                                checked={
                                                                                        conf()
                                                                                                .enabled
                                                                                }
                                                                                onChange={
                                                                                        handleEnabled
                                                                                }
                                                                        />
                                                                        <label
                                                                                class="toggle-label"
                                                                                for="enable-hotkeys-toggle"
                                                                        ></label>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                                <For each={grouped(groups())}>
                                        {(group, i) => {
                                                return (
                                                        <div class="space-y-3">
                                                                <div>
                                                                        <h1 class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
                                                                                {
                                                                                        group.type
                                                                                }
                                                                        </h1>
                                                                </div>
                                                                <div class="flex flex-col gap-5 p-5">
                                                                        <For
                                                                                each={
                                                                                        group.items
                                                                                }
                                                                        >
                                                                                {(
                                                                                        key,
                                                                                        index,
                                                                                ) => (
                                                                                        <div class="space-y-3">
                                                                                                <div class="flex justify-between">
                                                                                                        <div>
                                                                                                                <h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
                                                                                                                        {
                                                                                                                                key.name
                                                                                                                        }
                                                                                                                </h2>
                                                                                                                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                                                                                                                        {
                                                                                                                                key.description
                                                                                                                        }
                                                                                                                </p>
                                                                                                        </div>
                                                                                                        <div class="bg-secondary-10/70 flex h-fit w-70 items-center justify-between rounded py-1 pr-1 pl-3 text-sm">
                                                                                                                <div class="flex gap-2">
                                                                                                                        <For
                                                                                                                                each={
                                                                                                                                        key.keys
                                                                                                                                }
                                                                                                                        >
                                                                                                                                {(
                                                                                                                                        key,
                                                                                                                                ) => (
                                                                                                                                        <span class="keyboard-button">
                                                                                                                                                {
                                                                                                                                                        key
                                                                                                                                                }
                                                                                                                                        </span>
                                                                                                                                )}
                                                                                                                        </For>
                                                                                                                </div>
                                                                                                                <button
                                                                                                                        class="button-control"
                                                                                                                        onclick={(
                                                                                                                                e,
                                                                                                                        ) => {
                                                                                                                                e.currentTarget.classList.toggle(
                                                                                                                                        "active",
                                                                                                                                );
                                                                                                                                setTarget(
                                                                                                                                        (
                                                                                                                                                prev,
                                                                                                                                        ) =>
                                                                                                                                                prev
                                                                                                                                                        ? null
                                                                                                                                                        : key.name,
                                                                                                                                );
                                                                                                                                setCurrentKeys(
                                                                                                                                        [],
                                                                                                                                );
                                                                                                                        }}
                                                                                                                        disabled={
                                                                                                                                key.static
                                                                                                                        }
                                                                                                                >
                                                                                                                        <FeatherIcon />
                                                                                                                </button>
                                                                                                        </div>
                                                                                                </div>
                                                                                                <Show
                                                                                                        when={
                                                                                                                index() !==
                                                                                                                group
                                                                                                                        .items
                                                                                                                        .length -
                                                                                                                        1
                                                                                                        }
                                                                                                >
                                                                                                        <hr class="bg-secondary-10 h-px w-full border-0" />
                                                                                                </Show>
                                                                                        </div>
                                                                                )}
                                                                        </For>
                                                                </div>
                                                                <Show
                                                                        when={
                                                                                i() !==
                                                                                groups()
                                                                                        .length -
                                                                                        1
                                                                        }
                                                                >
                                                                        <hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
                                                                </Show>
                                                        </div>
                                                );
                                        }}
                                </For>
                        </div>
                </div>
        );
}
