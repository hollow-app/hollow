import { ImageIcon, MoveIcon } from "lucide-solid";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { DataBase, HollowEvent, ICard } from "hollow-api";
import { ImageData } from "./ImageMain";
import { ToolOptions } from "@type/ToolOptions";

type ImageProps = {
        data: ImageData;
        card: ICard;
        app: HollowEvent;
        db: DataBase;
};

export default function Image({ data, card, app, db }: ImageProps) {
        const [url, setUrl] = createSignal(data.url);
        const [caption, setCaption] = createSignal(data.caption || "");
        const [alt, setAlt] = createSignal(data.alt || "");
        const [objectFit, setObjectFit] = createSignal(data.objectFit);
        const [position, setPosition] = createSignal(
                data.position || { x: 50, y: 50 },
        );
        const [isDragging, setIsDragging] = createSignal(false);
        const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });
        const [showControls, setShowControls] = createSignal(false);

        const handleDragStart = (
                e: MouseEvent,
                direction: "up" | "down" | "left" | "right",
        ) => {
                if (objectFit() === "cover") {
                        setIsDragging(true);
                        setStartPos({ x: e.clientX, y: e.clientY });

                        const handleMove = (e: MouseEvent) => {
                                const deltaX = e.clientX - startPos().x;
                                const deltaY = e.clientY - startPos().y;

                                setPosition((prev) => ({
                                        x: Math.max(
                                                0,
                                                Math.min(
                                                        100,
                                                        prev.x -
                                                                (direction ===
                                                                        "left" ||
                                                                direction ===
                                                                        "right"
                                                                        ? deltaX /
                                                                          5
                                                                        : 0),
                                                ),
                                        ),
                                        y: Math.max(
                                                0,
                                                Math.min(
                                                        100,
                                                        prev.y -
                                                                (direction ===
                                                                        "up" ||
                                                                direction ===
                                                                        "down"
                                                                        ? deltaY /
                                                                          5
                                                                        : 0),
                                                ),
                                        ),
                                }));

                                setStartPos({ x: e.clientX, y: e.clientY });
                        };

                        const handleUp = () => {
                                setIsDragging(false);
                                document.removeEventListener(
                                        "mousemove",
                                        handleMove,
                                );
                                document.removeEventListener(
                                        "mouseup",
                                        handleUp,
                                );
                                // Save the new position
                                db.putData(card.name, {
                                        url: url(),
                                        caption: caption(),
                                        alt: alt(),
                                        objectFit: objectFit(),
                                        position: position(),
                                });
                        };

                        document.addEventListener("mousemove", handleMove);
                        document.addEventListener("mouseup", handleUp);
                }
        };

        const setImage = (file: File | string) => {
                if (typeof file !== "string" && file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                                setUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                } else {
                        setUrl(file as string);
                }
        };

        const setSettingsVisible = () => {
                const ini: ToolOptions = {
                        tool: "Image",
                        card: card.name,
                        save: () => {
                                db.putData(card.name, {
                                        url: url(),
                                        caption: caption(),
                                        alt: alt(),
                                        objectFit: objectFit(),
                                        position: position(),
                                });
                        },
                        options: [
                                {
                                        label: "Image",
                                        description:
                                                "Upload or provide image URL",
                                        type: "file",
                                        onChange: setImage,
                                        value: url(),
                                        accept: "image/*",
                                },
                                {
                                        type: "dropdown",
                                        label: "Fit Mode",
                                        description:
                                                "How the image should fit in its container",
                                        value: objectFit(),
                                        onChange: (value) => {
                                                setObjectFit(value);
                                                // Reset position when switching to cover
                                                if (value === "cover") {
                                                        setPosition({
                                                                x: 50,
                                                                y: 50,
                                                        });
                                                }
                                        },
                                        options: [
                                                "contain",
                                                "cover",
                                                "fill",
                                                "none",
                                                "scale-down",
                                        ],
                                },
                                {
                                        type: "text",
                                        label: "Caption",
                                        description:
                                                "Add a caption to your image",
                                        value: caption(),
                                        onChange: setCaption,
                                },
                                {
                                        type: "text",
                                        label: "Alt Text",
                                        description:
                                                "Add alternative text for accessibility",
                                        value: alt(),
                                        onChange: setAlt,
                                },
                        ],
                };
                app.emit("tool-settings", ini);
        };

        onMount(() => {
                app.on(`image-${card.name}-settings`, setSettingsVisible);
        });

        onCleanup(() => {
                app.off(`image-${card.name}-settings`, setSettingsVisible);
        });

        return (
                <div class="h-full w-full">
                        <div
                                class="bg-secondary-10/40 relative flex h-full items-center justify-center overflow-hidden rounded-lg"
                                onMouseEnter={() => setShowControls(true)}
                                onMouseLeave={() => setShowControls(false)}
                        >
                                <Show
                                        when={url()}
                                        fallback={
                                                <ImageIcon class="h-16 w-16 text-gray-900 opacity-50 dark:text-gray-50" />
                                        }
                                >
                                        <img
                                                src={url()}
                                                alt={alt()}
                                                class="h-full w-full"
                                                classList={{
                                                        "cursor-move":
                                                                objectFit() ===
                                                                        "cover" &&
                                                                isDragging(),
                                                }}
                                                style={{
                                                        "object-fit":
                                                                objectFit(),
                                                        "object-position":
                                                                objectFit() ===
                                                                "cover"
                                                                        ? `${position().x}% ${position().y}%`
                                                                        : "center",
                                                        "-webkit-user-drag":
                                                                "none",
                                                }}
                                        />
                                        <Show
                                                when={
                                                        objectFit() ===
                                                                "cover" &&
                                                        showControls()
                                                }
                                        >
                                                <div class="pointer-events-none absolute inset-0 bg-black/10 transition-opacity duration-200" />
                                                <button
                                                        class="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:bg-black/70"
                                                        onMouseDown={(e) =>
                                                                handleDragStart(
                                                                        e,
                                                                        "up",
                                                                )
                                                        }
                                                >
                                                        <MoveIcon size={16} />
                                                </button>
                                        </Show>
                                        <Show when={caption()}>
                                                <div class="bg-secondary/50 absolute bottom-2 left-2 size-fit rounded px-2 py-1 text-center backdrop-blur-sm">
                                                        <p class="text-secondary-95 text-sm">
                                                                {caption()}
                                                        </p>
                                                </div>
                                        </Show>
                                </Show>
                        </div>
                </div>
        );
}
