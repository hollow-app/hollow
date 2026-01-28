import MyIcon, { MyIconsType } from "@components/ui/MyIcon";
import { JSX, Show, splitProps } from "solid-js";

interface Props extends JSX.InputHTMLAttributes<HTMLInputElement> {
	icon?: MyIconsType;
	side?: "right" | "left";
}

export function Input(props: Props) {
	const [local, rest] = splitProps(props, ["icon", "side", "class"]);

	return (
		<div class="relative">
			<input
				class={local.class + " input"}
				style={
					local.icon && {
						"--padding-x":
							local.side === "right"
								? "calc(calc(var(--spacing) * 3)) var(--spacing) * 10)"
								: "calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
					}
				}
				{...rest}
			/>
			<Show when={local.icon}>
				<MyIcon
					name={local.icon}
					class="text-secondary-30 peer-focus:text-secondary-50 absolute top-1/2 size-5 -translate-y-1/2 transition-colors"
					style={{
						[local.side ?? "left"]: "calc(var(--spacing) * 2.5)",
					}}
				/>
			</Show>
		</div>
	);
}
