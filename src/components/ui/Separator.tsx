import { createMemo, Show } from "solid-js";

export const Separator = (props: {
	orientation?: "vertical" | "horizontal";
	variant?: number | string;
	label?: string;
}) => {
	const color = createMemo(
		() => "var(--color-secondary-" + (props.variant ?? 10) + ")",
	);
	return (
		<div
			class={
				"flex items-center gap-2 " +
				(props.orientation === "vertical"
					? "h-full w-fit flex-col"
					: "h-fit w-full")
			}
		>
			<hr
				role="separator"
				aria-orientation={props.orientation}
				class={
					props.orientation === "vertical"
						? "h-full w-px border-0"
						: "h-px w-full border-0"
				}
				style={{ background: color() }}
			/>
			<Show when={props.label}>
				<span class="text-secondary-30 font-medium">{props.label}</span>
				<hr
					role="separator"
					aria-orientation={props.orientation}
					class={
						props.orientation === "vertical"
							? "h-full w-px border-0"
							: "h-px w-full border-0"
					}
					style={{ background: color() }}
				/>
			</Show>
		</div>
	);
};
