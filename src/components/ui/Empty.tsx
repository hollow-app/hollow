import { Component, JSX, ParentComponent, Show } from "solid-js";
import MyIcon, { MyIconsType } from "../../App/components/ui/MyIcon";
import { Dynamic } from "solid-js/web";

interface Props extends JSX.HTMLAttributes<HTMLElement> {}
function Root(props: Props) {
	return (
		<div
			class={
				"border-secondary-10 flex max-w-100 flex-col items-center gap-3 rounded-lg px-8 py-4 text-center text-sm " +
				props.class
			}
		>
			{props.children}
		</div>
	);
}
const Description: ParentComponent = (props) => {
	return <div class="text-secondary-50">{props.children}</div>;
};
const Title: ParentComponent = (props) => {
	return (
		<div class="text-sm font-medium tracking-tight">{props.children}</div>
	);
};
function Icon(props: { icon: MyIconsType | Component }) {
	const isLocalIcon = typeof props.icon === "string";
	return (
		<Show
			when={isLocalIcon}
			fallback={
				<Dynamic
					component={() =>
						(props.icon as Component)({
							class: "bg-secondary-10 size-9 rounded-xl p-2",
						})
					}
				/>
			}
		>
			<MyIcon
				class="bg-secondary-10 size-9 rounded-xl p-2"
				name={(props.icon as MyIconsType) ?? "files/upload-outline"}
			/>
		</Show>
	);
}
export const Empty = {
	Root,
	Title,
	Description,
	Icon,
};
