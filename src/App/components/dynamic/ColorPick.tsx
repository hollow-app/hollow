import { hollow } from "../../../hollow";
import { createSignal } from "solid-js";

type ColorPickProps = {
	color: string;
	setColor: (c: string) => void;
	borderColor?: string;
	direct?: boolean;
};

export default function ColorPick(props: ColorPickProps) {
	const [myColor, setMyColor] = createSignal(props.color);

	const pick = () => {
		hollow.events.emit("color-picker", {
			color: props.direct ? props.color : myColor(),
			setColor: saveNewColor,
		});
	};

	const saveNewColor = (c: string) => {
		if (c !== myColor() || props.direct) {
			setMyColor(c);
			props.setColor(c);
		}
	};
	return (
		<>
			<button
				class="h-8 w-8 shrink-0 rounded-[30%] border-4"
				type="button"
				style={{
					background: props.direct ? props.color : myColor(),
					"border-color":
						props.borderColor ?? "var(--color-secondary-10)",
				}}
				onClick={pick}
			/>
			{/*<input class="hidden" name="colorPicked" value={myColor()} />*/}
		</>
	);
}
