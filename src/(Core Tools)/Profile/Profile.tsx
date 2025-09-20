import { ToolOptions } from "@type/ToolOptions";
import { DataBase, HollowEvent, ICard } from "hollow-api";
import { ImageIcon } from "lucide-solid";
import { createSignal, onCleanup, onMount, Show, For } from "solid-js";
import { ProfileData } from "./ProfileMain";
import { lazy } from "solid-js";
import MetaEditor from "./MetaEditor";
const Icon = lazy(() => import("@components/Icon"));

type Status = "available" | "busy" | "away";

type ProfileProps = {
        data?: ProfileData;
        card: ICard;
        app: HollowEvent;
        db: DataBase;
};

type MetaItem = {
        icon: string;
        label: string;
        value: any;
};

export default function Profile({ data, card, app, db }: ProfileProps) {
        const [name, setName] = createSignal(data.name);
        const [bio, setBio] = createSignal(data.bio);
        const [img, setImg] = createSignal(data.img);
        const [status, setStatus] = createSignal<Status>(
                data.status || "available",
        );
        const [meta, setMeta] = createSignal(data.meta);

        const statusColors = {
                available: "bg-green-500",
                busy: "bg-red-500",
                away: "bg-yellow-500",
        } as const;

        const setImage = (file: File | string) => {
                if (typeof file !== "string" && file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                                setImg(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                } else {
                        setImg(file as string);
                }
        };

        const setSettingsVisible = () => {
                const ini: ToolOptions = {
                        tool: "Profile",
                        card: card.name,
                        save: () => {
                                db.putData(card.name, {
                                        name: name(),
                                        bio: bio(),
                                        img: img(),
                                        status: status(),
                                        meta: meta(),
                                });
                        },
                        options: [
                                {
                                        label: "Picture",
                                        description:
                                                "Change the Profile Picture",
                                        type: "file",
                                        onChange: setImage,
                                        value: img(),
                                        accept: "image/*",
                                },
                                {
                                        type: "text",
                                        label: "Name",
                                        description: "Change the Profile Name",
                                        value: name(),
                                        onChange: setName,
                                },
                                {
                                        type: "dropdown",
                                        label: "Status",
                                        description:
                                                "Set your availability status",
                                        value: status(),
                                        onChange: setStatus,
                                        options: ["available", "busy", "away"],
                                },
                                {
                                        type: "longtext",
                                        label: "Bio",
                                        description:
                                                "Write something about yourself...",
                                        value: bio(),
                                        onChange: setBio,
                                },
                                {
                                        type: "custom",
                                        render: () => (
                                                <MetaEditor
                                                        meta={meta}
                                                        app={app}
                                                        setMeta={setMeta}
                                                />
                                        ),
                                },
                        ],
                };
                app.emit("tool-settings", ini);
        };

        const renderMetaItem = (item: MetaItem) => {
                if (Array.isArray(item.value)) {
                        return (
                                <div class="flex h-fit flex-col gap-1">
                                        <div class="flex items-center gap-2">
                                                <Icon name={item.icon} />
                                                <span class="text-sm font-medium capitalize">
                                                        {item.label}:
                                                </span>
                                        </div>
                                        <div class="flex flex-wrap gap-2">
                                                <For each={item.value}>
                                                        {(value) => (
                                                                <span class="bg-secondary-10 rounded px-2 py-1 text-xs text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200">
                                                                        {value}
                                                                </span>
                                                        )}
                                                </For>
                                        </div>
                                </div>
                        );
                }

                return (
                        <div class="flex h-fit items-center gap-2">
                                <Icon name={item.icon} />
                                <span class="text-sm font-medium capitalize">
                                        {item.label}:
                                </span>
                                <span class="text-sm text-neutral-600 dark:text-neutral-400">
                                        {item.value}
                                </span>
                        </div>
                );
        };

        onMount(() => {
                app.on(`profile-${card.name}-settings`, setSettingsVisible);
        });

        onCleanup(() => {
                app.off(`profile-${card.name}-settings`, setSettingsVisible);
        });

        return (
                <div class="max-size-full flex size-full flex-col gap-6">
                        <div class="flex size-full flex-col gap-6">
                                <div
                                        class="bg-secondary-10/40 aspect-square rounded-lg"
                                        style={{
                                                "background-image": img()
                                                        ? `url(${img()})`
                                                        : "none",
                                                "background-size": "cover",
                                                "background-position": "center",
                                                "background-repeat":
                                                        "no-repeat",
                                        }}
                                >
                                        {!img() && (
                                                <div class="flex h-full items-center justify-center">
                                                        <ImageIcon class="text-primary-500 h-16 w-16 opacity-50 dark:text-neutral-600" />
                                                </div>
                                        )}
                                </div>

                                <div class="flex flex-col overflow-hidden">
                                        <div class="flex shrink-0 items-center gap-3">
                                                <h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                                                        {name() || "Anonymous"}
                                                </h1>
                                                <div class="flex items-center gap-2">
                                                        <div
                                                                class={`h-3 w-3 rounded-full ${statusColors[status()]}`}
                                                        />
                                                        <span class="text-sm text-neutral-500 capitalize">
                                                                {status()}
                                                        </span>
                                                </div>
                                        </div>
                                        <div class="flex flex-col gap-4">
                                                <p class="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                                                        {bio() ||
                                                                "No bio yet..."}
                                                </p>
                                        </div>
                                </div>
                                <Show when={meta()?.length > 0}>
                                        <div class="flex flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto text-neutral-800 dark:text-neutral-200">
                                                <For each={meta()}>
                                                        {(item) =>
                                                                renderMetaItem(
                                                                        item,
                                                                )
                                                        }
                                                </For>
                                        </div>
                                </Show>
                        </div>
                </div>
        );
}
