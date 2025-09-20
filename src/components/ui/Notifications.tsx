import { NotifyType } from "@type/NotifyType";
import { Accessor, lazy, Suspense } from "solid-js";
import {
        createEffect,
        createMemo,
        createSignal,
        For,
        onMount,
        Setter,
        Show,
} from "solid-js";
import {
        ChevronDownIcon,
        SquareArrowOutUpRightIcon,
        XIcon,
} from "lucide-solid";
import { Motion, Presence } from "solid-motionone";
import { NotifyManager } from "@managers/NotifyManager";
const Icon = lazy(() => import("@components/Icon"));

type NotificationsProps = {
        isVisible: Accessor<boolean>;
        setVisible: Setter<boolean>;
};

export default function Notifications({
        isVisible,
        setVisible,
}: NotificationsProps) {
        const [notifications, setNotifications] = createSignal(
                NotifyManager.getSelf().system.notifications,
        );
        const visibleNotyList = createMemo(() =>
                notifications().filter((i) => i.visible),
        );
        const [cue, setCue] = createSignal([]);
        const getIconFromType = (
                type: string,
        ): { icon: string; color: string } => {
                switch (type) {
                        case "achievement":
                                return { icon: "Trophy", color: "#FFD700" };
                        case "reminder":
                                return { icon: "Bell", color: "#5A67D8" };
                        case "error":
                                return { icon: "OctagonX", color: "#E53E3E" };
                        case "info":
                                return { icon: "Info", color: "#3182CE" };
                        case "warning":
                                return {
                                        icon: "OctagonAlert",
                                        color: "#D69E2E",
                                };
                        case "update":
                                return { icon: "Rocket", color: "#38A169" };
                        default:
                                return { icon: "Megaphone", color: "#718096" };
                }
        };

        const addNoty = (n: NotifyType) => {
                setNotifications((prev) => [...prev, { ...n, visible: true }]);
                NotifyManager.getSelf().addNoty(n);
                setCue((prev) => [...prev, n.id]);
                setTimeout(() => {
                        setCue((prev) => [...prev.filter((i) => i !== n.id)]);
                        setTimeout(() => {
                                setNotifications((prev) =>
                                        prev.map((i) =>
                                                i.id === n.id
                                                        ? {
                                                                  ...i,
                                                                  visible: false,
                                                          }
                                                        : i,
                                        ),
                                );
                        }, 1000);
                }, 3000);
        };

        const removeNoty = (id: string) => {
                setNotifications((prev) => [
                        ...prev.filter((i) => i.id !== id),
                ]);

                NotifyManager.getSelf().removeNoty(id);
        };
        const clearAll = () => {
                setVisible(false);
                setNotifications([]);
                NotifyManager.getSelf().clearAll();
        };

        createEffect(() => {
                if (isVisible())
                        setNotifications((prev) => [
                                ...prev.map((i) => ({ ...i, visible: false })),
                        ]);
        });

        onMount(() => {
                window.hollowManager.on("Notify", addNoty);
        });

        return (
                <div class="pointer-events-none fixed right-5 bottom-5 z-10 h-[calc(100%-calc(var(--spacing)*20))] w-120 max-w-full">
                        <Show
                                when={
                                        visibleNotyList().length > 0 &&
                                        !isVisible()
                                }
                        >
                                <div class="pointer-events-none h-full space-y-4 overflow-hidden overflow-y-auto">
                                        <For each={visibleNotyList()}>
                                                {(noty) => (
                                                        <Presence>
                                                                <Show
                                                                        when={cue().find(
                                                                                (
                                                                                        i,
                                                                                ) =>
                                                                                        i ===
                                                                                        noty.id,
                                                                        )}
                                                                >
                                                                        <Motion
                                                                                initial={{
                                                                                        x: "100%",
                                                                                }}
                                                                                animate={{
                                                                                        x: "0%",
                                                                                }}
                                                                                exit={{
                                                                                        x: "100%",
                                                                                }}
                                                                                transition={{
                                                                                        duration: 0.4,
                                                                                }}
                                                                        >
                                                                                <Noty
                                                                                        tp={getIconFromType(
                                                                                                noty.type,
                                                                                        )}
                                                                                        noti={
                                                                                                noty
                                                                                        }
                                                                                        external
                                                                                />
                                                                        </Motion>
                                                                </Show>
                                                        </Presence>
                                                )}
                                        </For>
                                </div>
                        </Show>

                        <Presence>
                                <Show when={isVisible()}>
                                        <Motion
                                                initial={{
                                                        x: "100%",
                                                }}
                                                animate={{ x: "0%" }}
                                                exit={{ x: "100%" }}
                                                transition={{ duration: 0.4 }}
                                                class="bg-secondary-05 border-secondary-10 pointer-events-auto flex h-full flex-col overflow-hidden rounded-xl border p-4"
                                        >
                                                <div class="mb-4 flex h-15 items-center justify-between">
                                                        <h1 class="text-3xl font-bold tracking-tight text-neutral-700 dark:text-neutral-300">
                                                                Notifications
                                                        </h1>
                                                        <Show
                                                                when={
                                                                        notifications()
                                                                                .length >
                                                                        0
                                                                }
                                                        >
                                                                <div class="flex w-full p-2">
                                                                        <button
                                                                                onclick={
                                                                                        clearAll
                                                                                }
                                                                                class="button-secondary ml-auto"
                                                                        >
                                                                                Clear
                                                                                All
                                                                        </button>
                                                                </div>
                                                        </Show>
                                                </div>
                                                <div class="flex max-h-full flex-1 flex-col gap-3 overflow-hidden overflow-y-scroll">
                                                        <For
                                                                each={notifications()}
                                                        >
                                                                {(noti) => {
                                                                        const tp =
                                                                                getIconFromType(
                                                                                        noti.type,
                                                                                );
                                                                        return (
                                                                                <Noty
                                                                                        noti={
                                                                                                noti
                                                                                        }
                                                                                        tp={
                                                                                                tp
                                                                                        }
                                                                                        removeNoty={
                                                                                                removeNoty
                                                                                        }
                                                                                />
                                                                        );
                                                                }}
                                                        </For>
                                                        <Show
                                                                when={
                                                                        notifications()
                                                                                .length ===
                                                                        0
                                                                }
                                                        >
                                                                <span class="text-secondary-50 m-auto text-center tracking-tighter">
                                                                        You have
                                                                        no
                                                                        notifications
                                                                </span>
                                                        </Show>
                                                </div>
                                        </Motion>
                                </Show>
                        </Presence>
                </div>
        );
}

function Noty({
        noti,
        tp,
        external,
        removeNoty,
}: {
        noti: NotifyType;
        tp: { color: string; icon: string };
        external?: boolean;
        removeNoty?: (id: string) => void;
}) {
        const [expand, setExpand] = createSignal(false);
        return (
                <div
                        class="pointer-events-auto h-fit w-full rounded-xl border p-2"
                        classList={{
                                "bg-secondary-05 border-secondary-10": external,
                                "bg-secondary-10/60 border-secondary-15/60":
                                        !external,
                        }}
                >
                        <div
                                class="flex items-center gap-4"
                                style={{
                                        color: tp.color,
                                }}
                        >
                                <Suspense>
                                <Icon
                                        class="size-10 shrink-0 rounded-lg p-2.5"
                                        classList={{
                                                "bg-secondary-10": external,
                                                "bg-secondary-15/60": !external,
                                        }}
                                        name={tp.icon}
                                />
                                </Suspense>
                                <Show
                                        when={noti.attachment}
                                        fallback={
                                                <h1 class="truncate font-bold">
                                                        {noti.title}
                                                </h1>
                                        }
                                >
                                        <a
                                                class="flex min-w-0 flex-1 items-center gap-2"
                                                href={noti.attachment}
                                                target="_blank"
                                        >
                                                <h1 class="truncate font-bold">
                                                        {noti.title}
                                                </h1>
                                                <Show when={noti.attachment}>
                                                        <SquareArrowOutUpRightIcon class="size-4" />
                                                </Show>
                                        </a>
                                </Show>
                                <div class="ml-auto">
                                        <Show when={!external}>
                                                <button
                                                        class="button-control"
                                                        onclick={() =>
                                                                removeNoty(
                                                                        noti.id,
                                                                )
                                                        }
                                                >
                                                        <XIcon class="text-secondary-40" />
                                                </button>
                                        </Show>
                                        <button
                                                class="button-control"
                                                onclick={() =>
                                                        setExpand(
                                                                (prev) => !prev,
                                                        )
                                                }
                                        >
                                                <ChevronDownIcon
                                                        class="text-secondary-40"
                                                        classList={{
                                                                "rotate-180":
                                                                        expand(),
                                                        }}
                                                />
                                        </button>
                                </div>
                        </div>
                        <Show when={expand()}>
                                <div class="h-fit w-full px-1 pt-3 pb-1 text-neutral-400 dark:text-neutral-600">
                                        <p>{noti.message}</p>
                                </div>
                        </Show>
                </div>
        );
}
