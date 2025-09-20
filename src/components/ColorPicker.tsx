import { isHexColor } from "@managers/manipulation/colors";
import { PaintBucketIcon } from "lucide-solid";
import { readableColor } from "polished";
import { HexColorPicker } from "solid-colorful";
import { createMemo, createSignal, For, Setter } from "solid-js";

type ColorPickerProps = {
        p: { color: string; setColor: (c: string) => void };
};

export default function ColorPicker({ p }: ColorPickerProps) {
        const [myColor, setMyColor] = createSignal(p.color);
        const history = createMemo(() =>
                JSON.parse(
                        localStorage.getItem("ColorPicker.history") ??
                                JSON.stringify(Array(5).fill("#fff")),
                ),
        );
        const onSave = () => {
                p.setColor(myColor());
                window.hollowManager.emit("ColorPicker", null);
                let tHistory: string[] = history();
                const existingIndex = tHistory.indexOf(myColor());
                if (existingIndex !== -1) {
                        tHistory.splice(existingIndex, 1);
                }

                tHistory.unshift(myColor());

                if (history().length > 5) {
                        tHistory.pop();
                }
                localStorage.setItem(
                        "ColorPicker.history",
                        JSON.stringify(tHistory),
                );
        };
        const onCancel = () => {
                p.setColor(p.color);
                window.hollowManager.emit("ColorPicker", null);
        };
        const changeColor = (c: string) => {
                setMyColor(c);
        };
        const handleInput = (
                e: Event & {
                        currentTarget: HTMLInputElement;
                        target: HTMLInputElement;
                },
        ) => {
                if (isHexColor(e.currentTarget.value)) {
                        setMyColor(e.currentTarget.value);
                }
        };
        return (
                <div class="bg-secondary-05 border-secondary-15 pointer-events-auto absolute flex h-fit w-100 flex-col items-center gap-4 rounded-2xl border-1 p-7 shadow-[0_0_35px_35px_rgba(0,0,0,0.25)] dark:shadow-[0_0_105px_50px_rgba(0,0,0,0.6)]">
                        <div class="flex w-full items-center gap-2">
                                <div
                                        class="border-secondary-10 relative size-12 shrink-0 rounded-xl border-[6px] transition-transform hover:scale-105"
                                        style={{
                                                background: myColor(),
                                                "box-shadow": `0 0 12px ${myColor()}40`,
                                        }}
                                ></div>
                                <div class="relative flex-1">
                                        <input
                                                class="input bg-secondary-10/70 peer focus:bg-secondary-10 h-fit w-full text-sm transition-all duration-200"
                                                style={{
                                                        "--border-w": "0px",
                                                        "--padding-y":
                                                                "calc(var(--spacing) * 3.5)",
                                                        "--padding-x":
                                                                "calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
                                                        "--bg-color":
                                                                "var(--color-secondary-10)",
                                                }}
                                                value={myColor()}
                                                onchange={handleInput}
                                        />
                                        <PaintBucketIcon class="text-secondary-30 peer-focus:text-secondary-90 absolute top-1/2 left-3 w-5 -translate-y-1/2 transition-colors" />
                                </div>
                        </div>

                        <div class="relative h-[280px] w-full rounded-xl hover:cursor-pointer">
                                <HexColorPicker
                                        color={myColor()}
                                        onChange={changeColor}
                                />
                        </div>
                        <div class="bg-secondary-10/0 border-secondary-15 mx-auto flex w-full justify-center gap-2 rounded-xl border-t border-b border-dashed py-2">
                                <For each={history()}>
                                        {(hcolor) => (
                                                <div
                                                        style={{
                                                                background: hcolor,
                                                                "box-shadow": `0 2px 8px ${hcolor}30`,
                                                        }}
                                                        onclick={() =>
                                                                changeColor(
                                                                        hcolor,
                                                                )
                                                        }
                                                        class="border-secondary-15 group relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border-[3px] transition-all hover:-translate-y-0.5 hover:scale-110"
                                                >
                                                        <div
                                                                class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                                                                style={{
                                                                        background: "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.15) 100%)",
                                                                }}
                                                        />
                                                        {myColor() ===
                                                                hcolor && (
                                                                <div class="absolute inset-0 rounded-[4px] border-2 border-white/20" />
                                                        )}
                                                </div>
                                        )}
                                </For>
                        </div>

                        <div class="flex w-full justify-around gap-3">
                                <button
                                        onclick={onSave}
                                        type="button"
                                        class="button-primary w-full"
                                >
                                        Save
                                </button>
                                <button
                                        onclick={onCancel}
                                        type="button"
                                        class="button-secondary w-full"
                                >
                                        Cancel
                                </button>
                        </div>
                </div>
        );
}
