import { hollow } from "../../../hollow";
import { createSignal } from "solid-js";

export default function EmojiPick(props: {
	emo: string;
	emoChanged: (e: string) => void;
}) {
	const [emoji, setEmoji] = createSignal(props.emo);
	const handleEmoji = () => {
		hollow.events.emit("emoji-picker", {
			emoji: emoji(),
			setEmoji: onEmojiChanged,
		});
	};
	const onEmojiChanged = (newEmoji: string) => {
		props.emoChanged(newEmoji);
		setEmoji(newEmoji);
	};

	return (
		<button
			onclick={handleEmoji}
			class={
				"option-emoji content-center rounded-xl text-center text-gray-900 outline-none select-none dark:text-gray-50"
			}
			type="button"
		>
			{emoji()}
		</button>
	);
}
