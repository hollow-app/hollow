import MyIcon, { MyIconsType } from "@app/components/ui/MyIcon";
import { Component } from "solid-js";
import { createSignal, JSX, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

interface Props extends Omit<
	JSX.ButtonHTMLAttributes<HTMLButtonElement>,
	"onclick"
> {
	onclick?: (e: MouseEvent) => void | Promise<void>;
	variant?: "primary" | "secondary" | "empty" | "destructive" | "ghost";
	size?: "xs" | "sm" | "md" | "lg";
	icon?: boolean;
	matchPadding?: boolean;
	selected?: boolean;
}

function Root(props: Props) {
	const [local, rest] = splitProps(props, [
		"class",
		"children",
		"onclick",
		"icon",
		"variant",
		"size",
		"selected",
		"matchPadding",
	]);
	const [loading, setLoading] = createSignal(false);

	const handleClick: JSX.EventHandlerUnion<
		HTMLButtonElement,
		MouseEvent
	> = async (e) => {
		if (!local.onclick || loading()) return;
		const result = local.onclick(e);
		if (result instanceof Promise) {
			try {
				setLoading(true);
				await result;
			} finally {
				setLoading(false);
			}
		}
	};

	return (
		<button
			class={[
				"button relative flex items-center justify-center gap-3 overflow-hidden",
				local.icon || local.matchPadding ? "icon" : "",
				local.class,
				local.variant ?? "secondary",
			].join(" ")}
			onclick={handleClick}
			classList={{
				["text-" + (local.size || "sm")]: true,
				selected: local.selected,
			}}
			{...rest}
		>
			<Presence>
				<Show when={loading()}>
					<Motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.2 }}
						class="absolute inset-0 flex items-center justify-center"
					>
						<Show
							when={local.icon}
							fallback={
								<div class="flex gap-1">
									<div class="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-current"></div>
									<div class="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:0.2s]"></div>
									<div class="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:0.4s]"></div>
								</div>
							}
						>
							<div
								class="h-5 w-5 animate-spin rounded-full border-2 border-current"
								style={{
									"border-color": "var(--color)",
									"border-top-color":
										"color-mix(in oklab, var(--color), transparent 80%)",
								}}
							/>
						</Show>
					</Motion.div>
				</Show>
			</Presence>

			<Motion.div
				animate={{ opacity: loading() ? 0 : 1, y: loading() ? -20 : 0 }}
				transition={{ duration: 0.2 }}
				class="flex shrink-0 items-center gap-2"
			>
				{local.children}
			</Motion.div>
		</button>
	);
}
const Icon = (props: { icon: MyIconsType | Component }) => {
	return (
		<Show when={props.icon}>
			<Show
				when={typeof props.icon === "string"}
				fallback={
					<Dynamic
						component={props.icon}
						class={"text-secondary-30 size-4.5 opacity-100"}
					/>
				}
			>
				<MyIcon
					name={props.icon as MyIconsType}
					class="size-4.5 opacity-100"
					style={{
						color: "var(--icon-color, var(--color-secondary-30))",
					}}
				/>
			</Show>
		</Show>
	);
};
export const Button = {
	Root,
	Icon,
};
