import MyIcon, { MyIconsType } from "@components/ui/MyIcon";
import { createSignal, JSX, Show, splitProps } from "solid-js";
import { Motion, Presence } from "solid-motionone";

interface Props
	extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onclick"> {
	onclick?: (e: MouseEvent) => void | Promise<void>;
	variant?: "primary" | "secondary" | "destructive";
	leftIcon?: MyIconsType;
	rightIcon?: MyIconsType;
	icon?: boolean;
}

export function Button(props: Props) {
	const [local, rest] = splitProps(props, [
		"class",
		"children",
		"onclick",
		"leftIcon",
		"rightIcon",
		"icon",
		"variant",
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
				local.icon ? "icon" : "",
				local.class,
				local.variant ?? "",
			].join(" ")}
			onclick={handleClick}
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
				class="flex items-center gap-2"
			>
				<Show when={local.leftIcon}>
					<MyIcon name={local.leftIcon} />
				</Show>
				{local.children}
				<Show when={local.rightIcon}>
					<MyIcon name={local.rightIcon} />
				</Show>
			</Motion.div>
		</button>
	);
}
