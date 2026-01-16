import { CardType } from "@type/hollow";
import { HandType } from "@type/HandType";
import { Grid2X2PlusIcon, Grid2x2XIcon, StarIcon } from "lucide-solid";
import { Accessor, createSignal, Setter, Show } from "solid-js";
import EmojiPick from "../dynamic/EmojiPick";
import { timeDifference } from "@utils/manipulation/strings";
import { useStore } from "../../store/index";
import ToolIcon from "./ToolIcon";
import MyIcon from "./MyIcon";

export default function CardConfig({
	myCard,
	icon,
	index,
}: {
	myCard: CardType;
	icon: string;
	index: Accessor<number>;
}) {
	const { dispatch } = useStore();
	const [isPlaced, setPlaced] = createSignal(myCard.data.isPlaced);
	const [isFav, setFav] = createSignal(myCard.data.isFavored);

	const handlePlacement = () => {
		dispatch({
			domain: "module",
			type: "toggle-instance",
			toolName: myCard.data.tool,
			id: myCard.id,
		});
		setPlaced(!isPlaced());
	};
	const handleDelete = async () => {
		dispatch({
			domain: "module",
			type: "remove-instance",
			toolName: myCard.data.tool,
			cardIds: [myCard.id],
			fs: true,
		});
	};
	const handleFav = async () => {
		dispatch({
			domain: "module",
			type: "update-instance",
			toolName: myCard.data.tool,
			cardId: myCard.id,
			updates: { isFavored: !isFav() },
		});
		setFav(!isFav());
	};
	const onEmojiChanged = (newEmoji: string) => {
		dispatch({
			domain: "module",
			type: "update-instance",
			toolName: myCard.data.tool,
			cardId: myCard.id,
			updates: { emoji: newEmoji },
		});
	};

	return (
		<>
			<div class="group card-config flex w-[calc(calc(var(--spacing)*104)-40px)] shrink-0 justify-between px-1 py-3">
				<div class="min-w-0 space-y-2">
					<div class="dark:text-secondary-30 text-secondary-50 flex w-fit items-center gap-1">
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

				<div class="dark:text-secondary-30 text-secondary-50 flex h-full flex-col items-end gap-3">
					<StarIcon
						class="size-4 cursor-pointer rounded transition-transform hover:rotate-12"
						onclick={handleFav}
						classList={{
							"text-yellow-500 fill-yellow-500": isFav(),
						}}
					/>

					<div class="mt-auto flex gap-5">
						<button
							class="size-4 cursor-pointer rounded transition-transform hover:rotate-12"
							onclick={handleDelete}
						>
							<MyIcon name="trash" class="size-4" />
						</button>

						<button
							class="card-config-place size-4 cursor-pointer rounded transition-transform hover:rotate-12"
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
