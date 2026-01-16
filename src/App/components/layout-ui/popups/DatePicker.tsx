import { MyIconFun } from "@components/ui/MyIcon";
import PopupWrapper from "../PopupWrapper";
import { Calendar, type Options } from "vanilla-calendar-pro";
import "@styles/calendar.css";

import { onCleanup, onMount } from "solid-js";

interface Props {
	cal: { options: Options; onSave: () => void };
	hide: () => void;
}
export default function DatePicker(props: Props) {
	let el!: HTMLDivElement;
	let calendar: Calendar;
	onMount(() => {
		calendar = new Calendar(el, props.cal.options);
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
			<div class="px-4 pb-4">
				<div ref={el}></div>
				<div class="border-secondary-15 flex w-full justify-end gap-3 border-t border-dashed pt-2">
					<button
						onclick={() => {
							props.cal.onSave();
							props.hide();
						}}
						type="button"
						class="button primary"
						style={{ "--w": "100%" }}
					>
						Save
					</button>
					<button
						onclick={props.hide}
						type="button"
						class="button secondary"
						style={{ "--w": "100%" }}
					>
						Cancel
					</button>
				</div>
			</div>
		</PopupWrapper>
	);
}
