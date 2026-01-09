import { ImageIcon, MoveIcon } from "lucide-solid";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { CardType, IStore, ToolApi } from "@type/hollow";
import { ToolOptions } from "@type/hollow";
import { ImageType } from "./ImageType";
import { hollow } from "hollow";

type ImageProps = {
	data: ImageType;
	card: CardType;
	store: IStore;
	toolEvents: ToolApi;
};
export default function Image({ data, card, store, toolEvents }: ImageProps) {
	const [image, setImage] = createSignal(data);
	const [isDragging, setIsDragging] = createSignal(false);
	const [startPos, setStartPos] = createSignal({ x: 0, y: 0 });
	const [showControls, setShowControls] = createSignal(false);

	const handleDragStart = (
		e: MouseEvent,
		direction: "up" | "down" | "left" | "right",
	) => {
		if (image().objectFit === "cover") {
			setIsDragging(true);
			setStartPos({ x: e.clientX, y: e.clientY });

			const handleMove = (e: MouseEvent) => {
				const deltaX = e.clientX - startPos().x;
				const deltaY = e.clientY - startPos().y;

				setImage((prev) => ({
					...prev,
					position: {
						x: Math.max(
							0,
							Math.min(
								100,
								prev.position.x -
									(direction === "left" ||
									direction === "right"
										? deltaX / 5
										: 0),
							),
						),
						y: Math.max(
							0,
							Math.min(
								100,
								prev.position.y -
									(direction === "up" || direction === "down"
										? deltaY / 5
										: 0),
							),
						),
					},
				}));

				setStartPos({ x: e.clientX, y: e.clientY });
			};

			const handleUp = () => {
				setIsDragging(false);
				document.removeEventListener("mousemove", handleMove);
				document.removeEventListener("mouseup", handleUp);
				updateImage();
			};

			document.addEventListener("mousemove", handleMove);
			document.addEventListener("mouseup", handleUp);
		}
	};
	const updateImage = async () => {
		store.set(card.id, image());
	};
	const selectFromVault = (url?: string) => {
		if (url) {
			setImage((prev) => ({ ...prev, url: url }));
			return;
		}
		hollow.events.emit("show-vault", {
			onSelect: (newUrl) =>
				setImage((prev) => ({ ...prev, url: newUrl })),
		});
	};
	const setSettingsVisible = () => {
		const settings: ToolOptions = {
			tool: "Image",
			card: card.data.name,
			save: updateImage,
			options: [
				{
					label: "Image",
					description: "Upload or provide image URL",
					type: "file",
					onAction: selectFromVault,
					value: image().url,
				},
				{
					type: "segmented",
					label: "Fit Mode",
					description: "How the image should fit in its container",
					value: image().objectFit,
					onAction: (value: any) => {
						setImage((prev) => ({
							...prev,
							objectFit: value,
							...(value === "cover"
								? { position: { x: 50, y: 50 } }
								: {}),
						}));
					},
					options: [
						{ key: "contain", title: "contain" },
						{ key: "cover", title: "cover" },
						{ key: "fill", title: "fill" },
						{ key: "none", title: "none" },
						{ key: "scale-down", title: "scale-down" },
					],
				},
				{
					type: "text",
					label: "Caption",
					description: "Add a caption to your image",
					value: image().caption,
					onAction: (v) =>
						setImage((prev) => ({ ...prev, caption: v })),
				},
				{
					type: "text",
					label: "Alt Text",
					description: "Add alternative text for accessibility",
					value: image().alt,
					onAction: (v) => setImage((prev) => ({ ...prev, alt: v })),
				},
			],
		};
		hollow.events.emit("tool-settings", settings);
	};

	onMount(() => {
		toolEvents.on(`${card.id}-settings`, setSettingsVisible);
	});

	onCleanup(() => {
		toolEvents.off(`${card.id}-settings`, setSettingsVisible);
	});

	return (
		<div class="h-full w-full">
			<div
				class="relative flex h-full items-center justify-center overflow-hidden rounded-lg bg-[var(--front)]"
				onMouseEnter={() => setShowControls(true)}
				onMouseLeave={() => setShowControls(false)}
			>
				<Show
					when={image().url}
					fallback={
						<ImageIcon class="h-16 w-16 text-gray-900 opacity-50 dark:text-gray-50" />
					}
				>
					<img
						src={image().url}
						alt={image().alt}
						class="h-full w-full"
						classList={{
							"cursor-move":
								image().objectFit === "cover" && isDragging(),
						}}
						style={{
							"object-fit": image().objectFit,
							"object-position":
								image().objectFit === "cover"
									? `${image().position.x}% ${image().position.y}%`
									: "center",
							"-webkit-user-drag": "none",
						}}
					/>
					<Show
						when={image().objectFit === "cover" && showControls()}
					>
						<button
							class="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:bg-black/70"
							onMouseDown={(e) => handleDragStart(e, "up")}
						>
							<MoveIcon size={16} />
						</button>
					</Show>
					<Show when={image().caption}>
						<div class="bg-secondary/50 absolute bottom-2 left-2 size-fit rounded px-2 py-1 text-center backdrop-blur-sm">
							<p class="text-secondary-95 text-sm">
								{image().caption}
							</p>
						</div>
					</Show>
				</Show>
			</div>
		</div>
	);
}
