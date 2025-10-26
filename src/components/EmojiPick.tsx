import { hollow } from "hollow";
import { createSignal } from "solid-js";

export default function EmojiPick({
	emo,
	emoChanged,
}: {
	emo: string;
	emoChanged: (e: string) => void;
}) {
	const [emoji, setEmoji] = createSignal(emo);
	const handleEmoji = () => {
		hollow.events.emit("emoji-picker", {
			emoji: emoji(),
			setEmoji: onEmojiChanged,
		});
	};
	const onEmojiChanged = (newEmoji: string) => {
		emoChanged(newEmoji);
		setEmoji(newEmoji);
	};

	return (
		<button
			onclick={handleEmoji}
			class={
				"content-center rounded-xl text-center text-gray-900 select-none dark:text-gray-50"
			}
		>
			{emoji()}
		</button>
	);
}
