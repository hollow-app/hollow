import { AlertType } from "@type/hollow";
import { hollow } from "hollow";
import { readableColor } from "polished";
import { createSignal, For, onMount, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";

export default function Alerts() {
	const [alerts, setAlerts] = createSignal<(AlertType & { id: string })[]>([
		{
			id: "ts",
			message: "test something",
		},
		{
			id: "t",
			message: "test something",
			accent: "#FFCD03",
		},
	]);
	const [cue, setCue] = createSignal([]);

	const addAlert = (alert: AlertType) => {
		const uniqueAlert = { ...alert, id: crypto.randomUUID() };
		setAlerts((prev) => [uniqueAlert, ...prev]);
		setCue((prev) => [...prev, uniqueAlert.id]);
		// setTimeout(() => {
		// 	setCue((prev) => [...prev.filter((i) => i !== uniqueAlert.id)]);
		// 	setTimeout(() => {
		// 		setAlerts((prev) =>
		// 			prev.filter((i) => i.id !== uniqueAlert.id),
		// 		);
		// 	}, 4000);
		// }, alert.duration ?? 3000);
	};

	onMount(() => {
		hollow.events.on("alert", addAlert);
	});

	return (
		<Show when={alerts().length > 0}>
			<div class="pointer-events-none fixed top-4 right-4 z-10 box-border flex h-full w-fit flex-col gap-2">
				<For each={alerts()}>
					{(alert) => (
						<Presence>
							{/* <Show when={cue().includes(alert.id)}> */}
							<Motion.span
								initial={{ x: "100%" }}
								animate={{ x: 0 }}
								exit={{ x: "110%" }}
								transition={{ duration: 0.4 }}
								class="pointer-events-auto rounded-lg border px-3 py-2 text-sm"
								style={{
									"background-color": alert.accent
										? `color-mix(in oklab, ${alert.accent}, black 10%)`
										: "var(--color-secondary-05)",
									"border-color":
										alert.accent ??
										"var(--color-secondary-10)",
									color: alert.accent
										? readableColor(alert.accent)
										: "var(--color-secondary-95)",
								}}
							>
								{alert.message}
							</Motion.span>
							{/* </Show> */}
						</Presence>
					)}
				</For>
			</div>
		</Show>
	);
}
