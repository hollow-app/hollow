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
	const [isPlaced, setPlaced] = createSignal(myCard.data.extra.isPlaced);
	const [isFav, setFav] = createSignal(myCard.data.extra.isFavored);

	const handlePlacement = () => {
		hollow.toolManager.togglePlacement(myCard.id, myCard.data.extra.tool);
		setPlaced(!isPlaced());
	};
	const handleDelete = async () => {
		await hollow.toolManager.deleteCard(
			myCard.id,
			myCard.data.extra.tool,
			true,
		);
		// setHand([...hollow.toolManager.getHand()]);
	};
	const handleFav = async () => {
		hollow.toolManager.setCard(myCard.data.extra.tool, myCard.id, {
			isFavored: !isFav(),
		});
		setFav(!isFav());
	};
	const onEmojiChanged = (newEmoji: string) => {
		hollow.toolManager.changeEmoji(
			newEmoji,
			myCard.id,
			myCard.data.extra.tool,
		);
		// TODO
		hollow.events.off("emoji-picker-changed", onEmojiChanged);
	};

	return (
		<>
			<div class="group w-[calc(calc(var(--spacing)*104)-40px)] shrink-0 space-y-1 p-3">
				<div class="flex w-full justify-between">
					<div>
						<div class="w-fit">
							<div class="text-secondary-25 flex w-fit items-center gap-1 p-1">
								<ToolIcon
									toolName={icon ?? myCard.data.extra.tool}
									class="size-4"
								/>
								<span class="text-xs">
									{myCard.data.extra.tool}
								</span>
							</div>
							<hr
								class="h-px w-full shrink-0 border-0"
								style={{
									background:
										"linear-gradient(to right, transparent , var(--color-secondary-20) 5%, transparent)",
								}}
							/>
						</div>
						<div class="mt-1 flex items-center gap-2">
							<div class="bg-secondary-10 hover:border-secondary-15 size-7 cursor-pointer rounded border border-transparent p-1 text-center text-sm">
								<EmojiPick
									emo={myCard.data.extra.emoji}
									emoChanged={onEmojiChanged}
								/>
							</div>
							<span class="text-neutral-800 dark:text-neutral-200">
								{myCard.data.extra.name}
							</span>
						</div>
					</div>
					<div class="p-2">
						<StarIcon
							class="text-secondary-30 fill-secondary-30 size-4 cursor-pointer transition-all hover:rotate-45"
							onclick={handleFav}
							classList={{
								"text-yellow-500 fill-yellow-500": isFav(),
							}}
						/>
					</div>
				</div>
				<div class="text-xs text-neutral-500">
					<p title={myCard.data.extra.CreatedDate}>
						Created: {timeDifference(myCard.data.extra.CreatedDate)}
					</p>
				</div>
				<div class="ml-auto flex w-fit gap-2">
					<button class="button-control red" onclick={handleDelete}>
						<MyIcon name="trash" class="size-4" />
					</button>
					<button class="button-control" onclick={handlePlacement}>
						<Show
							when={isPlaced()}
							fallback={<Grid2X2PlusIcon class="size-4" />}
						>
							<Grid2x2XIcon class="text-secondary-20 size-4" />
						</Show>
					</button>
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
