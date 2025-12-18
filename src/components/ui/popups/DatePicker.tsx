import { MyIconFun } from "@components/MyIcon";
import PopupWrapper from "../PopupWrapper";
import { Calendar, type Options } from "vanilla-calendar-pro";
import "@styles/calendar.css";

import { onCleanup, onMount } from "solid-js";

interface Props {
	options: Options;
	hide: () => void;
}
export default function DatePicker(props: Props) {
	let el!: HTMLDivElement;
	let calendar: Calendar;
	onMount(() => {
		calendar = new Calendar(el, props.options);
		calendar.init();
	});
	onCleanup(() => {
		calendar.destroy();
	});
	return (
		<PopupWrapper
			Icon={MyIconFun({ name: "calendar" })}
			title="Date Picker"
			onClose={props.hide}
		>
			<div class="mx-3 mb-3">
				<div ref={el}></div>
			</div>
		</PopupWrapper>
	);
}
