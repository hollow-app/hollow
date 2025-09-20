import { Item } from "@type/ContextMenuItem";
import { ChevronRightIcon } from "lucide-solid";
import { createSignal, For, Show, createEffect, Suspense } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { lazy } from "solid-js";
const Icon = lazy(() => import("@components/Icon"));

export default function ContextMenuSide({
        icon,
        label,
        children,
        position,
}: Item & { position: () => { xflip: boolean; yflip: boolean } }) {
        const [hovered, setHovered] = createSignal(false);
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        const handleMouseOver = () => {
                setHovered(true);
                if (timeoutId) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                }
        };
        const handleMouseLeave = () => {
                timeoutId = setTimeout(() => {
                        setHovered(false);
                }, 300);
        };

        return (
                <div class="relative" onMouseLeave={handleMouseLeave}>
                        <button class="button-cm" onMouseOver={handleMouseOver}>
                                <Suspense><Icon name={icon} class="h-4 w-4" /></Suspense>
                                {label}
                                {children && (
                                        <ChevronRightIcon class="text-secondary-30 ml-auto" />
                                )}
                        </button>
                        <Presence>
                                <Show when={hovered()}>
                                        <Motion
                                                class="bg-secondary-05 absolute mx-2 h-fit w-70 rounded-xl py-3"
                                                onMouseOver={handleMouseOver}
                                                classList={{
                                                        "right-[100%]":
                                                                position()
                                                                        .xflip,
                                                        "bottom-0": position()
                                                                .yflip,
                                                        "left-[100%]":
                                                                !position()
                                                                        .xflip,
                                                        "top-0": !position()
                                                                .yflip,
                                                }}
                                                initial={{ opacity: 0, y: -25 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -25 }}
                                                transition={{ duration: 0.3 }}
                                        >
                                                <For each={children}>
                                                        {(child) => (
                                                                <button
                                                                        class="button-cm active-cm"
                                                                        onclick={() => {
                                                                                child.onclick();
                                                                                window.hollowManager.emit(
                                                                                        "context-menu",
                                                                                        false,
                                                                                );
                                                                        }}
                                                                >
                                                                        <Suspense><Icon
                                                                                name={
                                                                                        child.icon
                                                                                }
                                                                                class="h-4 w-4"
                                                                        /></Suspense>
                                                                        {
                                                                                child.label
                                                                        }
                                                                </button>
                                                        )}
                                                </For>
                                                {children.length === 0 && (
                                                        <p class="text-secondary-30 button-cm pointer-events-none">
                                                                Empty
                                                        </p>
                                                )}
                                        </Motion>
                                </Show>
                        </Presence>
                </div>
        );
}
