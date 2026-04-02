import { createMemo, Show } from "solid-js";

import { splitProps, JSX } from "solid-js";

type SeparatorProps = {
	orientation?: "horizontal" | "vertical";
	class?: string;
	variant?: number | string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function Separator(props: SeparatorProps) {
	const [local, others] = splitProps(props, ["orientation", "class"]);

	const isVertical = () => local.orientation === "vertical";
	const color = createMemo(
		() => "var(--color-secondary-" + (props.variant ?? 10) + ")",
	);

	return (
		<div
			role="separator"
			aria-orientation={local.orientation ?? "horizontal"}
			style={{ background: color() }}
			class={[
				"shrink-0",
				isVertical() ? "h-full w-px" : "h-px w-full",
				local.class,
			]
				.filter(Boolean)
				.join(" ")}
			{...others}
		/>
	);
}

// export const Separator = (props: {
// 	orientation?: "vertical" | "horizontal";
// 	variant?: number | string;
// 	label?: string;
// 	class?: string;
// }) => {
// 	const color = createMemo(
// 		() => "var(--color-secondary-" + (props.variant ?? 10) + ")",
// 	);
// 	return (
// 		<div
// 			class={
// 				"flex items-center gap-2 " +
// 				(props.orientation === "vertical"
// 					? "h-full w-fit flex-col"
// 					: "h-fit w-full") +
// 				" " +
// 				(props.class || "")
// 			}
// 		>
// 			<hr
// 				role="separator"
// 				aria-orientation={props.orientation}
// 				class={
// 					props.orientation === "vertical"
// 						? "h-full w-px border-0"
// 						: "h-px w-full border-0"
// 				}
// 				style={{ background: color() }}
// 			/>
// 			<Show when={props.label}>
// 				<span class="text-secondary-30 font-medium">{props.label}</span>
// 				<hr
// 					role="separator"
// 					aria-orientation={props.orientation}
// 					class={
// 						props.orientation === "vertical"
// 							? "h-full w-px border-0"
// 							: "h-px w-full border-0"
// 					}
// 					style={{ background: color() }}
// 				/>
// 			</Show>
// 		</div>
// 	);
// };
