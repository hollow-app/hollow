import { CardInfo } from "@type/CardInfo";
import { HandType } from "@type/HandType";
import { Grid2X2PlusIcon, Grid2x2XIcon, Trash2Icon } from "lucide-solid";
import { createSignal, Setter } from "solid-js";
import EmojiPick from "./EmojiPick";

export default function Card({
	toolName,
	myCard,
	setHand,
}: {
	toolName: string;
	myCard: CardInfo;
	setHand: Setter<HandType[]>;
}) {
	const [isPlaced, setPlaced] = createSignal(myCard.isPlaced);

	const handlePlacement = () => {
		window.toolManager.togglePlacement(myCard.name, toolName);
		setPlaced(!isPlaced());
	};
	const handleDelete = async () => {
		await window.toolManager.deleteCard(myCard.name, toolName);
		setHand([...window.toolManager.hand]);
	};
	const onEmojiChanged = (newEmoji: string) => {
		window.toolManager.changeEmoji(newEmoji, myCard.name, toolName);
		window.hollowManager.off("emoji-picker-changed", onEmojiChanged);
	};
	return (
		<div class="group bg-secondary-05 grid h-fit w-full shrink-0 grid-cols-[1fr_5fr_2fr] rounded p-2 select-none">
			<EmojiPick emo={myCard.emoji} emoChanged={onEmojiChanged} />
			<div class="pl-3">
				<h2 class="text-sm text-gray-950 dark:text-gray-50">
					{myCard.name}
				</h2>
				<h2 class="text-sm text-gray-600">{myCard.CreatedDate}</h2>
			</div>
			<div class="m-auto flex h-fit w-fit items-center gap-3">
				<button class="button-control red" onclick={handleDelete}>
					<Trash2Icon />
				</button>
				<button
					class="button-control"
					style={
						isPlaced()
							? {
									"--c": "var(--color-neutral-500)",
								}
							: {}
					}
					onclick={handlePlacement}
				>
					{isPlaced() ? <Grid2x2XIcon /> : <Grid2X2PlusIcon />}
				</button>
			</div>
		</div>
	);
}
