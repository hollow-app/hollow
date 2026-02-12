import MyIcon, { MyIconsType } from "@app/components/ui/MyIcon";
import { JSX, Show, splitProps } from "solid-js";

interface Props extends JSX.InputHTMLAttributes<HTMLInputElement> {
	icon?: MyIconsType;
	side?: "right" | "left";
}

export function Input(props: Props) {
	let input!: HTMLInputElement;
	const [local, rest] = splitProps(props, ["icon", "side", "class", "style"]);

	const togglePassword = (
		e: Event & { currentTarget: HTMLButtonElement },
	) => {
		const isPassword = input.getAttribute("type") === "password";
		input.setAttribute("type", isPassword ? "text" : "password");
		e.currentTarget.classList.toggle("text-secondary-30");
	};

	return (
		<div class="relative flex h-fit w-full items-center">
			<input
				ref={input}
				class={local.class + " input"}
				style={{
					...((local.style ?? {}) as JSX.CSSProperties),
					...(local.icon && {
						"--padding-x":
							local.side === "right"
								? "calc(calc(var(--spacing) * 3)) var(--spacing) * 10)"
								: "calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
					}),
				}}
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
			<Show when={rest.type === "password"}>
				<button
					class="text-secondary-30 absolute right-1 rounded-md p-1 outline-none hover:scale-105 active:scale-95"
					onclick={togglePassword}
				>
					<MyIcon
						name={"eye"}
						data-visible="some"
						class="size-5 transition-colors"
					/>
				</button>
			</Show>
		</div>
	);
}
