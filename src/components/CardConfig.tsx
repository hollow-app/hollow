import { CardType } from "@type/hollow";
import { HandType } from "@type/HandType";
import { Grid2X2PlusIcon, Grid2x2XIcon, StarIcon } from "lucide-solid";
import { createSignal, Setter, Show } from "solid-js";
import EmojiPick from "./dynamic/EmojiPick";
import { timeDifference } from "@managers/manipulation/strings";
import { hollow } from "hollow";
import ToolIcon from "./ToolIcon";
import MyIcon from "./MyIcon";

export default function CardConfig({
	myCard,
	// setHand,
	icon,
}: {
	myCard: CardType;
	icon: string;
	// setHand: Setter<HandType[]>;
}) {
	const [isPlaced, setPlaced] = createSignal(myCard.data.isPlaced);
	const [isFav, setFav] = createSignal(myCard.data.isFavored);

	const handlePlacement = () => {
		hollow.toolManager.togglePlacement(myCard.id, myCard.data.tool);
		setPlaced(!isPlaced());
	};
	const handleDelete = async () => {
		await hollow.toolManager.deleteCard(
			[myCard.id],
			myCard.data.tool,
			true,
		);
		// setHand([...hollow.toolManager.getHand()]);
	};
	const handleFav = async () => {
		hollow.toolManager.setCard(myCard.data.tool, myCard.id, {
			isFavored: !isFav(),
		});
		setFav(!isFav());
	};
	const onEmojiChanged = (newEmoji: string) => {
		hollow.toolManager.changeEmoji(newEmoji, myCard.id, myCard.data.tool);
		// TODO
		hollow.events.off("emoji-picker-changed", onEmojiChanged);
	};

	return (
		<>
			<div class="group flex w-[calc(calc(var(--spacing)*104)-40px)] shrink-0 justify-between px-1 py-3">
				<div class="min-w-0 space-y-2">
					<div class="text-secondary-30 flex w-fit items-center gap-1">
						<ToolIcon
							toolName={icon ?? myCard.data.tool}
							class="size-4"
						/>
						<span class="text-xs font-medium tracking-wide uppercase">
							{myCard.data.tool}
						</span>
					</div>

					<div class="flex items-center gap-3">
						<div class="border-secondary-10 hover:border-secondary-20 size-10 rounded border p-1 text-center text-2xl transition-colors">
							<EmojiPick
								emo={myCard.data.emoji}
								emoChanged={onEmojiChanged}
							/>
						</div>
						<span class="truncate font-medium text-neutral-800 dark:text-neutral-200">
							{myCard.data.name}
						</span>
					</div>
					<div class="mt-3 flex items-center justify-between text-xs text-neutral-500">
						<p title={myCard.data.CreatedDate}>
							Created: {timeDifference(myCard.data.CreatedDate)}
						</p>
					</div>
				</div>

				<div class="flex h-full flex-col items-end gap-3">
					<StarIcon
						class="text-secondary-30 size-4 cursor-pointer transition-transform hover:rotate-12"
						onclick={handleFav}
						classList={{
							"text-yellow-500 fill-yellow-500": isFav(),
						}}
					/>

					<div class="mt-auto flex gap-5">
						<button
							class="text-secondary-30 size-4 cursor-pointer transition-transform hover:rotate-12"
							onclick={handleDelete}
						>
							<MyIcon name="trash" class="size-4" />
						</button>

						<button
							class="text-secondary-30 size-4 cursor-pointer transition-transform hover:rotate-12"
							onclick={handlePlacement}
						>
							<Show
								when={isPlaced()}
								fallback={<Grid2X2PlusIcon class="size-4" />}
							>
								<Grid2x2XIcon class="text-secondary-20 size-4" />
							</Show>
						</button>
					</div>
				</div>
			</div>

			<hr
				class="h-px w-full shrink-0 border-0"
				style={{
					background:
						"linear-gradient(to right, transparent, var(--color-secondary-10) 20%, transparent)",
				}}
			/>
		</>
	);
}
