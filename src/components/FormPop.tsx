import { handleOptionFile } from "@managers/manipulation/images";
import { FormType } from "@type/FormType";
import { InfoIcon } from "lucide-solid";
import { Accessor, For, onMount } from "solid-js";
import { createSignal } from "solid-js";
import ColorPick from "./ColorPick";
import DropDown from "./DropDown";
import EmojiPick from "./EmojiPick";
import NumberInput from "./NumberInput";
import Slider from "./Slider";
import WordInput from "./WordInput";

type FormPopProps = {
        form: Accessor<FormType>;
};
export default function FormPop({ form }: FormPopProps) {
        const [result, setResult] = createSignal({
                ...form().options.reduce((acc: Record<string, any>, obj) => {
                        acc[obj.key] = obj.value;
                        return acc;
                }, {}),
                id: form().id,
        });
        const onSave = () => {
                const submission: any = result();
                if (
                        !form().options.some((i) => {
                                if (i.optional) return false;
                                return i.dependsOn
                                        ? i.dependsOn.conditions.includes(
                                                  submission[i.dependsOn.key] &&
                                                          !submission[i.key],
                                          )
                                        : !submission[i.key];
                        })
                ) {
                        form().submit(submission);
                        window.hollowManager.emit("Form", null);
                        // console.log(submission);
                } else {
                }
        };
        const onCancel = () => {
                window.hollowManager.emit("Form", null);
        };
        return (
                <div class="border-secondary-15 shadow-popup bg-secondary-05 pointer-events-auto absolute flex max-h-[85vh] w-[85vw] max-w-[800px] flex-col gap-4 rounded-xl border-1 p-8">
                        <div class="flex items-center justify-between">
                                <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                                        {form().title}
                                </h1>
                        </div>

                        <div class="flex flex-col overflow-x-hidden overflow-y-auto px-1">
                                <For each={form().options}>
                                        {(preOption, index) => {
                                                const option = {
                                                        ...preOption,
                                                        onChange: (v: any) => {
                                                                setResult(
                                                                        (
                                                                                prev,
                                                                        ) => ({
                                                                                ...prev,
                                                                                [preOption.key]:
                                                                                        v,
                                                                        }),
                                                                );
                                                        },
                                                };
                                                const dependable = () =>
                                                        option.dependsOn &&
                                                        !option.dependsOn.conditions.includes(
                                                                (
                                                                        result() as any
                                                                )[
                                                                        option
                                                                                .dependsOn
                                                                                .key
                                                                ],
                                                        );
                                                return (
                                                        <div
                                                                class="relative transition-all duration-200 ease-in-out"
                                                                classList={{
                                                                        " hidden": dependable(),
                                                                        " my-2": !dependable(),
                                                                }}
                                                        >
                                                                <div class="mb-2 flex items-center gap-2">
                                                                        <h2 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                                                                {
                                                                                        option.label
                                                                                }
                                                                                {!option.optional && (
                                                                                        <span class="text-primary">
                                                                                                *
                                                                                        </span>
                                                                                )}
                                                                        </h2>
                                                                        {option.description && (
                                                                                <div class="relative flex">
                                                                                        <InfoIcon class="peer text-secondary-40 h-5 w-5" />
                                                                                        <p class="border-secondary-10 dark:bg-secondary-05 dark:text-secondary-40 invisible absolute left-8 z-10 w-64 rounded border-1 bg-white p-3 text-sm shadow-lg transition-opacity peer-hover:visible">
                                                                                                {
                                                                                                        option.description
                                                                                                }
                                                                                        </p>
                                                                                </div>
                                                                        )}
                                                                </div>
                                                                {(() => {
                                                                        switch (
                                                                                option.type
                                                                        ) {
                                                                                case "text":
                                                                                        return (
                                                                                                <input
                                                                                                        type="text"
                                                                                                        class="input"
                                                                                                        style={{
                                                                                                                "--bg-color":
                                                                                                                        "var(--color-secondary-10)",
                                                                                                        }}
                                                                                                        placeholder={
                                                                                                                option.placeholder
                                                                                                        }
                                                                                                        value={
                                                                                                                option.value ??
                                                                                                                ""
                                                                                                        }
                                                                                                        onInput={(
                                                                                                                e,
                                                                                                        ) =>
                                                                                                                option.onChange(
                                                                                                                        e
                                                                                                                                .currentTarget
                                                                                                                                .value,
                                                                                                                )
                                                                                                        }
                                                                                                />
                                                                                        );
                                                                                case "longtext":
                                                                                        return (
                                                                                                <textarea
                                                                                                        class="input resize-none"
                                                                                                        style={{
                                                                                                                "--bg-color":
                                                                                                                        "var(--color-secondary-10)",
                                                                                                        }}
                                                                                                        placeholder={
                                                                                                                option.placeholder
                                                                                                        }
                                                                                                        value={
                                                                                                                option.value ??
                                                                                                                ""
                                                                                                        }
                                                                                                        onInput={(
                                                                                                                e,
                                                                                                        ) =>
                                                                                                                option.onChange(
                                                                                                                        e
                                                                                                                                .currentTarget
                                                                                                                                .value,
                                                                                                                )
                                                                                                        }
                                                                                                />
                                                                                        );

                                                                                case "number":
                                                                                        return (
                                                                                                <NumberInput
                                                                                                        value={
                                                                                                                option.value ??
                                                                                                                option.min
                                                                                                        }
                                                                                                        setValue={
                                                                                                                option.onChange
                                                                                                        }
                                                                                                        min={
                                                                                                                option.min
                                                                                                        }
                                                                                                        max={
                                                                                                                option.max
                                                                                                        }
                                                                                                        direct
                                                                                                />
                                                                                        );

                                                                                case "boolean":
                                                                                        return (
                                                                                                <div class="toggle-switch">
                                                                                                        <input
                                                                                                                class="toggle-input"
                                                                                                                id={`tool-option-toggle-${index()}`}
                                                                                                                type="checkbox"
                                                                                                                checked={
                                                                                                                        !!option.value
                                                                                                                }
                                                                                                                onchange={(
                                                                                                                        e,
                                                                                                                ) =>
                                                                                                                        option.onChange(
                                                                                                                                e
                                                                                                                                        .currentTarget
                                                                                                                                        .checked,
                                                                                                                        )
                                                                                                                }
                                                                                                        />
                                                                                                        <label
                                                                                                                class="toggle-label"
                                                                                                                for={`tool-option-toggle-${index()}`}
                                                                                                        ></label>
                                                                                                </div>
                                                                                        );

                                                                                case "button":
                                                                                        return (
                                                                                                <button
                                                                                                        onClick={
                                                                                                                option.onChange
                                                                                                        }
                                                                                                        class="button-secondary"
                                                                                                >
                                                                                                        click
                                                                                                </button>
                                                                                        );

                                                                                case "color":
                                                                                        return (
                                                                                                <ColorPick
                                                                                                        color={
                                                                                                                option.value ??
                                                                                                                "#FFFFFF"
                                                                                                        }
                                                                                                        setColor={
                                                                                                                option.onChange
                                                                                                        }
                                                                                                />
                                                                                        );

                                                                                case "emoji":
                                                                                        return (
                                                                                                <button
                                                                                                        class={
                                                                                                                "bg-secondary-10 h-10 w-10 content-center rounded-xl text-center text-2xl text-gray-900 select-none dark:text-gray-50"
                                                                                                        }
                                                                                                >
                                                                                                        <EmojiPick
                                                                                                                emo={
                                                                                                                        option.value ??
                                                                                                                        "☂️"
                                                                                                                }
                                                                                                                emoChanged={
                                                                                                                        option.onChange
                                                                                                                }
                                                                                                        />
                                                                                                </button>
                                                                                        );

                                                                                case "dropdown":
                                                                                        return (
                                                                                                <DropDown
                                                                                                        value={
                                                                                                                option.value ??
                                                                                                                option
                                                                                                                        .options[0]
                                                                                                        }
                                                                                                        onSelect={(
                                                                                                                v,
                                                                                                        ) =>
                                                                                                                option.onChange(
                                                                                                                        v,
                                                                                                                )
                                                                                                        }
                                                                                                        items={
                                                                                                                option.options
                                                                                                        }
                                                                                                />
                                                                                        );

                                                                                case "file":
                                                                                        return (
                                                                                                <div class="flex items-center space-x-2">
                                                                                                        <span class="text-secondary-30 w-30 truncate text-sm"></span>
                                                                                                        <label class="button-secondary cursor-pointer">
                                                                                                                Choose
                                                                                                                File
                                                                                                                <input
                                                                                                                        type="file"
                                                                                                                        accept={
                                                                                                                                option.accept
                                                                                                                        }
                                                                                                                        onChange={(
                                                                                                                                e,
                                                                                                                        ) => {
                                                                                                                                handleOptionFile(
                                                                                                                                        e,
                                                                                                                                        option,
                                                                                                                                );
                                                                                                                        }}
                                                                                                                        class="hidden"
                                                                                                                />
                                                                                                        </label>
                                                                                                </div>
                                                                                        );

                                                                                case "range":
                                                                                        return (
                                                                                                <Slider
                                                                                                        min={
                                                                                                                option.min
                                                                                                        }
                                                                                                        max={
                                                                                                                option.max
                                                                                                        }
                                                                                                        value={
                                                                                                                option.value ??
                                                                                                                option.min
                                                                                                        }
                                                                                                        setValue={
                                                                                                                option.onChange
                                                                                                        }
                                                                                                />
                                                                                        );

                                                                                case "keywords":
                                                                                        return (
                                                                                                <div class="max-h-40 max-w-full">
                                                                                                        <WordInput
                                                                                                                words={() =>
                                                                                                                        option.value
                                                                                                                }
                                                                                                                setWords={
                                                                                                                        option.onChange
                                                                                                                }
                                                                                                                placeholder={
                                                                                                                        option.placeholder
                                                                                                                }
                                                                                                        />
                                                                                                </div>
                                                                                        );

                                                                                default:
                                                                                        return null;
                                                                        }
                                                                })()}
                                                        </div>
                                                );
                                        }}
                                </For>
                        </div>
                        <div class="bg-secondary-10/60 mt-auto flex h-fit w-full justify-end gap-5 rounded p-5">
                                <button class="button-primary" onclick={onSave}>
                                        {form().update ? "Update" : "Submit"}
                                </button>
                                <button
                                        class="button-secondary"
                                        onclick={onCancel}
                                >
                                        Cancel
                                </button>
                        </div>
                </div>
        );
}
//
//const form: FormType = {
//        title: "Example Settings",
//        submit: (submission) => {
//                console.log("Form submitted with:", submission);
//        },
//        options: [
//                {
//                        type: "text",
//                        label: "Username",
//                        placeholder: "Example",
//                        key: "username",
//                        description: "Enter your preferred username",
//                },
//                {
//                        type: "number",
//                        label: "Age",
//                        key: "age",
//                        min: 0,
//                        max: 120,
//                },
//                {
//                        type: "boolean",
//                        label: "Receive Newsletter",
//                        key: "newsletter",
//                        optional: true,
//                },
//                {
//                        type: "dropdown",
//                        label: "Favorite Language",
//                        key: "language",
//                        options: ["JavaScript", "TypeScript", "Rust", "Go"],
//                },
//                {
//                        type: "range",
//                        label: "Volume",
//                        key: "volume",
//                        min: 0,
//                        max: 100,
//                        step: 1,
//                },
//                {
//                        type: "custom",
//                        label: "Custom Block",
//                        key: "customComponent",
//                        optional: true,
//                        render: () => (
//                                <div
//                                        style={{
//                                                padding: "8px",
//                                                background: "#eee",
//                                        }}
//                                >
//                                        Hello from custom
//                                </div>
//                        ),
//                        flexDirection: "row",
//                },
//        ],
//};
