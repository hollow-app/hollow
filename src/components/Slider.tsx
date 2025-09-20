import { createMemo, createSignal, For } from "solid-js";

type SliderProps = {
        value: number;
        setValue: (n: number) => void;
        min?: number;
        max?: number;
};
export default function Slider({
        value,
        setValue,
        min = 0,
        max = 100,
}: SliderProps) {
        const [myValue, setMyValue] = createSignal<number>(value);
        let spn!: HTMLSpanElement;
        const [left, setLeft] = createSignal<number>(0);

        const handleRangeChange = (e: Event) => {
                const target = e.target as HTMLInputElement;
                setMyValue(Number(target.value));
        };

        const backgroundStyle = createMemo(
                () =>
                        `linear-gradient(to right, var(--primary-color-05) 0%, var(--primary-color-05)  ${myValue()}%, var(--secondary-color-10)${myValue()}%, var(--secondary-color-10) 100%)`,
        );

        return (
                <div
                        class={`slider-wrap group pointer-events-auto relative w-70 pb-[16px]`}
                        onmousemove={(e) => {
                                setLeft(
                                        e.clientX -
                                                e.currentTarget.getBoundingClientRect()
                                                        .left -
                                                spn.getBoundingClientRect()
                                                        .width /
                                                        2,
                                );
                        }}
                >
                        <span
                                ref={spn}
                                class="bg-secondary-10 border-secondary-15 text-secondary-50 absolute bottom-8 h-fit rounded border-1 px-2 text-center opacity-0 transition-opacity group-active:opacity-100"
                                style={{ left: `${left()}px` }}
                        >
                                {myValue()}
                        </span>
                        <input
                                type="range"
                                min={min}
                                max={max}
                                value={myValue()}
                                onmouseup={() => setValue(myValue())}
                                class="slider-range rounded-[2px]"
                                onInput={handleRangeChange}
                                onMouseMove={handleRangeChange}
                                style={{ background: backgroundStyle() }}
                        />
                </div>
        );
}
