import { JSX } from "solid-js";
import MyIcon, { MyIconsType } from "../../App/components/ui/MyIcon";

interface Props extends JSX.HTMLAttributes<HTMLElement> {
	icon: MyIconsType;
	title: any;
	descriptions: any;
}
export function Empty(props: Props) {
	return (
		<div
			class={
				"border-secondary-10 flex max-w-100 flex-col items-center gap-5 rounded-lg px-8 py-4 text-center text-sm " +
				props.class
			}
		>
			<MyIcon
				class="bg-secondary-10 size-10 rounded-xl p-2"
				name={props.icon ?? "files/upload-outline"}
			/>
			<div class="text-sm font-medium tracking-tight">{props.title}</div>
			<div class="text-secondary-50">{props.descriptions}</div>
			{props.children}
		</div>
	);
}
