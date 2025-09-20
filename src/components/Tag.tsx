import { readableColor } from "polished";

type TagProps = {
        background: () => string;
        tag: () => string;
        foreground: () => string;
        title?: string;
};
export default function Tag({ background, tag, foreground, title }: TagProps) {
        return (
                <span
                        class="h-fit shrink-0 truncate rounded-md border-t px-[0.4em] py-[0.3em] font-bold select-none"
                        style={{
                                background: `color-mix(in oklab, ${background()} 15%, transparent)`,
                                color: background(),
                                "line-height": 1,
                                "border-color": `color-mix(in oklab, ${background()} 5%, transparent)`,
                        }}
                        title={title}
                >
                        {tag()}
                </span>
        );
}
