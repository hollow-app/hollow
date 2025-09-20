import { FormType } from "@type/FormType";
import { HollowEvent } from "hollow-api";
import { SquarePenIcon, Trash2Icon } from "lucide-solid";
import { Accessor, For, Setter } from "solid-js";

type metaType = {
        id: string;
        label: string;
        icon: string;
        value: string;
};
type MetaEditorProps = {
        meta: Accessor<metaType[]>;
        setMeta: Setter<metaType[]>;
        app: HollowEvent;
};
export default function MetaEditor({ meta, app, setMeta }: MetaEditorProps) {
        const addMeta = () => {
                const save = (data: any) => {
                        const label = data.label;
                        const icon = data.icon;
                        const value = data.value;
                        setMeta((prev) => [
                                ...prev,
                                {
                                        id: crypto.randomUUID(),
                                        label,
                                        icon,
                                        value,
                                },
                        ]);
                };
                submitForm(save);
        };

        const removeMeta = (id: string) => {
                setMeta((prev) => [...prev.filter((item) => item.id !== id)]);
        };
        const updateMeta = (id: string) => {
                const save = (data: any) => {
                        const label = data.label;
                        const icon = data.icon;
                        const value = data.value;
                        setMeta((prev) => [
                                ...prev.map((item) =>
                                        item.id === id
                                                ? {
                                                          ...item,
                                                          label,
                                                          icon,
                                                          value,
                                                  }
                                                : item,
                                ),
                        ]);
                };
                submitForm(save, id);
        };
        const submitForm = (save: (data: any) => void, id?: string) => {
                const target = id
                        ? meta().find((item) => item.id === id)
                        : null;
                const form: FormType = {
                        id: id || "meta",
                        title: id ? "Update Meta" : "Add Meta",
                        submit: save,
                        update: !!id,
                        options: [
                                {
                                        key: "label",
                                        label: "Label",
                                        type: "text",
                                        placeholder: "Enter label",
                                        value: target?.label ?? "",
                                },
                                {
                                        key: "icon",
                                        label: "Icon",
                                        type: "text",
                                        description:
                                                "Enter the icon you want to use for this meta data, names are available at lucide.dev",
                                        placeholder: "Enter icon name",
                                        value: target?.icon ?? "",
                                },
                                {
                                        key: "type",
                                        label: "Type",
                                        type: "dropdown",
                                        options: ["text", "list"],
                                        value: Array.isArray(target?.value)
                                                ? "list"
                                                : "text",
                                },
                                {
                                        key: "value",
                                        label: "Value",
                                        type: "text",
                                        placeholder: "Enter value",
                                        dependsOn: {
                                                key: "type",
                                                conditions: ["text"],
                                        },
                                        value: !Array.isArray(target?.value)
                                                ? target?.value
                                                : "",
                                },
                                {
                                        key: "value",
                                        label: "Value",
                                        type: "keywords",
                                        placeholder: "Enter values",
                                        dependsOn: {
                                                key: "type",
                                                conditions: ["list"],
                                        },
                                        value: !Array.isArray(target?.value)
                                                ? target?.value
                                                : (target.value ?? []),
                                },
                        ],
                };

                app.emit("Form", form);
        };
        return (
                <div class="flex w-full flex-col gap-4">
                        <div class="flex h-fit justify-between">
                                <div>
                                        <h1 class="text-lg font-bold">Meta</h1>
                                        <h3 class="text-secondary-40">
                                                Add some meta data to your
                                                profile
                                        </h3>
                                </div>
                                <button
                                        class="button-secondary h-fit"
                                        onClick={addMeta}
                                >
                                        Add
                                </button>
                        </div>
                        <div class="bg-secondary-10/60 grid w-full grid-cols-4 gap-5 rounded-lg p-4">
                                <For each={meta()}>
                                        {(item) => (
                                                <div class="bg-secondary-05 border-secondary-20 group rounded border-1 p-2.5">
                                                        <div class="flex items-start justify-between gap-2">
                                                                <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                                                                        <h3 class="truncate text-base font-semibold">
                                                                                {
                                                                                        item.label
                                                                                }
                                                                        </h3>
                                                                        <div class="text-secondary-40 flex flex-col gap-1 text-sm">
                                                                                <div class="flex gap-1.5">
                                                                                        <span class="font-medium">
                                                                                                icon:
                                                                                        </span>
                                                                                        <span
                                                                                                class="truncate"
                                                                                                title={
                                                                                                        item.icon
                                                                                                }
                                                                                        >
                                                                                                {
                                                                                                        item.icon
                                                                                                }
                                                                                        </span>
                                                                                </div>
                                                                                <div class="flex gap-1.5">
                                                                                        <span class="font-medium">
                                                                                                value:
                                                                                        </span>
                                                                                        {Array.isArray(
                                                                                                item.value,
                                                                                        ) ? (
                                                                                                <span
                                                                                                        class="truncate"
                                                                                                        title={item.value.join(
                                                                                                                ", ",
                                                                                                        )}
                                                                                                >
                                                                                                        {item.value.join(
                                                                                                                ", ",
                                                                                                        )}
                                                                                                </span>
                                                                                        ) : (
                                                                                                <span
                                                                                                        class="truncate"
                                                                                                        title={
                                                                                                                item.value
                                                                                                        }
                                                                                                >
                                                                                                        {
                                                                                                                item.value
                                                                                                        }
                                                                                                </span>
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                                <div class="flex flex-shrink-0 flex-col gap-1">
                                                                        <button
                                                                                class="button-control"
                                                                                onclick={() =>
                                                                                        updateMeta(
                                                                                                item.id,
                                                                                        )
                                                                                }
                                                                                title="Edit"
                                                                        >
                                                                                <SquarePenIcon class="size-3.5" />
                                                                        </button>
                                                                        <button
                                                                                class="button-control red opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                                                                onclick={() =>
                                                                                        removeMeta(
                                                                                                item.id,
                                                                                        )
                                                                                }
                                                                                title="Delete"
                                                                        >
                                                                                <Trash2Icon class="size-3.5" />
                                                                        </button>
                                                                </div>
                                                        </div>
                                                </div>
                                        )}
                                </For>
                        </div>
                </div>
        );
}
