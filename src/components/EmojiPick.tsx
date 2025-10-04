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
		window.hollowManager.emit("emoji-picker", {
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
				"h-10 w-10 content-center rounded-xl text-center text-2xl text-gray-900 select-none dark:text-gray-50 "
			}
		>
			{emoji()}
		</button>
	);
}
