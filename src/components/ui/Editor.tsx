import Sidepanel from "@components/animations/Sidepanel";
import ColorPick from "@components/ColorPick";
import DropDown from "@components/DropDown";
import NumberInput from "@components/NumberInput";
import { KitEditorType } from "@type/KitEdiorType";
import { PencilRulerIcon } from "lucide-solid";
import {
        Accessor,
        createSignal,
        createMemo,
        onCleanup,
        onMount,
        Show,
} from "solid-js";

type EditorProps = {
        isVisible: Accessor<boolean>;
};

export default function Editor({ isVisible }: EditorProps) {
        const [kit, setKit] = createSignal(window.editorKit);
        const hand = createMemo(() => window.toolManager.hand);
        const [target, setTarget] = createSignal({ tool: "", card: "" });

        const onSave = () => {
                window.setEditor(false);
                window.hollowManager.emit("Editor.changed");
                setKit(null);
        };
        const onCancel = () => {
                kit().setWidth(kit().width);
                kit().setHeight(kit().height);
                kit().setCorner(kit().corner);
                kit().setOpacity(kit().opacity);
                kit().setBorderWidth(kit().border.n);
                kit().setBorderColor(kit().border.c);
                kit().setGlass(kit().glass);
                kit().setShadow(kit().shadow);
                kit().setX(kit().xyz.x);
                kit().setY(kit().xyz.y);
                kit().setZ(kit().xyz.z);
                window.setEditor(false);
                setKit(null);
        };

        onMount(() => {
                window.editorKit = setKit;
        });
        onCleanup(() => {
                window.editorKit = null;
        });

        return (
                <Sidepanel isVisible={isVisible}>
                        <PencilRulerIcon class="mx-auto h-20 w-20" />
                        <Show when={kit()}>
                                <div class="h-fit max-h-full overflow-hidden overflow-y-scroll pr-3 pl-[calc(var(--spacing)*3+8px)] text-gray-950 dark:text-gray-50">
                                        <h1 class="mt-12 text-2xl font-bold">
                                                Size
                                        </h1>
                                        <div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
                                                <div class="flex items-center justify-between">
                                                        <h3>Width</h3>
                                                        <div class="w-70 max-w-[50%]">
                                                                <NumberInput
                                                                        value={
                                                                                kit()
                                                                                        .width
                                                                        }
                                                                        setValue={
                                                                                kit()
                                                                                        .setWidth
                                                                        }
                                                                        direct
                                                                />
                                                        </div>
                                                </div>
                                                <div class="flex items-center justify-between">
                                                        <h3>Height</h3>
                                                        <div class="w-70 max-w-[50%]">
                                                                <NumberInput
                                                                        value={
                                                                                kit()
                                                                                        .height
                                                                        }
                                                                        setValue={
                                                                                kit()
                                                                                        .setHeight
                                                                        }
                                                                        direct
                                                                />
                                                        </div>
                                                </div>
                                        </div>
                                        <h1 class="mt-4 text-2xl font-bold">
                                                Appearance
                                        </h1>
                                        <div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
                                                <div class="flex items-center justify-between">
                                                        <h3>Corner</h3>
                                                        <div class="w-70 max-w-[50%]">
                                                                <NumberInput
                                                                        value={
                                                                                kit()
                                                                                        .corner
                                                                        }
                                                                        setValue={
                                                                                kit()
                                                                                        .setCorner
                                                                        }
                                                                        direct
                                                                />
                                                        </div>
                                                </div>
                                                <div class="flex items-center justify-between">
                                                        <h3>Opacity</h3>
                                                        <div class="w-70 max-w-[50%]">
                                                                <NumberInput
                                                                        value={
                                                                                kit()
                                                                                        .opacity
                                                                        }
                                                                        setValue={
                                                                                kit()
                                                                                        .setOpacity
                                                                        }
                                                                        step={
                                                                                0.1
                                                                        }
                                                                        max={1}
                                                                        direct
                                                                />
                                                        </div>
                                                </div>
                                                <div class="flex items-center justify-between">
                                                        <h3>Border</h3>
                                                        <div class="flex w-[60%] items-center justify-end gap-1">
                                                                <ColorPick
                                                                        color={
                                                                                kit()
                                                                                        .border
                                                                                        .c
                                                                        }
                                                                        setColor={(
                                                                                nc,
                                                                        ) =>
                                                                                kit().setBorderColor(
                                                                                        nc,
                                                                                )
                                                                        }
                                                                />
                                                                <div class="w-70 max-w-[90%]">
                                                                        <NumberInput
                                                                                value={
                                                                                        kit()
                                                                                                .border
                                                                                                .n
                                                                                }
                                                                                setValue={(
                                                                                        nn,
                                                                                ) =>
                                                                                        kit().setBorderWidth(
                                                                                                nn,
                                                                                        )
                                                                                }
                                                                                direct
                                                                        />
                                                                </div>
                                                        </div>
                                                </div>
                                                <div class="flex items-center justify-between">
                                                        <h3>Glass</h3>
                                                        <div class="toggle-switch">
                                                                <input
                                                                        class="toggle-input"
                                                                        id="editor-glass-toggle"
                                                                        type="checkbox"
                                                                        checked={
                                                                                kit()
                                                                                        .glass
                                                                        }
                                                                        onclick={() =>
                                                                                kit().setGlass(
                                                                                        (
                                                                                                prev,
                                                                                        ) =>
                                                                                                !prev,
                                                                                )
                                                                        }
                                                                />
                                                                <label
                                                                        class="toggle-label"
                                                                        for="editor-glass-toggle"
                                                                ></label>
                                                        </div>
                                                </div>
                                                <div class="flex items-center justify-between">
                                                        <h3>Shadow</h3>
                                                        <div class="toggle-switch">
                                                                <input
                                                                        class="toggle-input"
                                                                        id="editor-shadow-toggle"
                                                                        type="checkbox"
                                                                        checked={
                                                                                kit()
                                                                                        .shadow
                                                                        }
                                                                        onclick={() =>
                                                                                kit().setShadow(
                                                                                        (
                                                                                                prev,
                                                                                        ) =>
                                                                                                !prev,
                                                                                )
                                                                        }
                                                                />
                                                                <label
                                                                        class="toggle-label"
                                                                        for="editor-shadow-toggle"
                                                                ></label>
                                                        </div>
                                                </div>
                                        </div>
                                        <h1 class="mt-4 text-2xl font-bold">
                                                Position
                                        </h1>
                                        <div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
                                                <div class="flex items-center justify-between">
                                                        <h3>X</h3>
                                                        <div class="w-70 max-w-[50%]">
                                                                <NumberInput
                                                                        value={
                                                                                kit()
                                                                                        .xyz
                                                                                        .x
                                                                        }
                                                                        setValue={(
                                                                                n,
                                                                        ) =>
                                                                                kit().setX(
                                                                                        n,
                                                                                )
                                                                        }
                                                                        direct
                                                                />
                                                        </div>
                                                </div>
                                                <div class="flex items-center justify-between">
                                                        <h3>Y</h3>
                                                        <div class="w-70 max-w-[50%]">
                                                                <NumberInput
                                                                        value={
                                                                                kit()
                                                                                        .xyz
                                                                                        .y
                                                                        }
                                                                        setValue={(
                                                                                n,
                                                                        ) =>
                                                                                kit().setY(
                                                                                        n,
                                                                                )
                                                                        }
                                                                        direct
                                                                />
                                                        </div>
                                                </div>
                                                <div class="flex items-center justify-between">
                                                        <h3>Z</h3>
                                                        <div class="w-70 max-w-[50%]">
                                                                <NumberInput
                                                                        value={
                                                                                kit()
                                                                                        .xyz
                                                                                        .z
                                                                        }
                                                                        setValue={(
                                                                                n,
                                                                        ) =>
                                                                                kit().setZ(
                                                                                        n,
                                                                                )
                                                                        }
                                                                        direct
                                                                />
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </Show>
                        <div class="mt-2 flex min-h-20 w-full gap-4 pr-3 pl-[calc(var(--spacing)*3+8px)]">
                                <button class="button-primary" onclick={onSave}>
                                        Save
                                </button>
                                <button
                                        class="button-secondary"
                                        onclick={onCancel}
                                >
                                        Cancel
                                </button>
                        </div>
                </Sidepanel>
        );
}
