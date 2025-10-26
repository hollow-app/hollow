import { hollow } from "hollow";
import { createSignal } from "solid-js";

type ColorPickProps = {
	color: () => string;
	setColor: (c: string) => void;
	borderColor?: string;
};

export default function ColorPick({
	color,
	setColor,
	borderColor,
}: ColorPickProps) {
	const [myColor, setMyColor] = createSignal(color());

	const pick = () => {
		hollow.events.emit("color-picker", {
			color: myColor(),
			setColor: saveNewColor,
		});
	};
	const saveNewColor = (c: string) => {
		if (c !== color()) {
			setMyColor(c);
			setColor(c);
		}
	};
	return (
		<>
			<button
				class="h-8 w-8 shrink-0 rounded-[30%] border-4"
				type="button"
				style={{
					background: myColor(),
					"border-color": borderColor ?? "var(--secondary-color-15)",
				}}
				onClick={pick}
			/>
			{/*<input class="hidden" name="colorPicked" value={myColor()} />*/}
		</>
	);
}
