import CheckSquareOutlineIcon from "@assets/icons/check-square-outline.svg";
import XSquareOutlineIcon from "@assets/icons/x-square-outline.svg";
import AlertTriangleOutlineIcon from "@assets/icons/alert-triangle-outline.svg";
import AlertSquareOutlineIcon from "@assets/icons/alert-square-outline.svg";
import { AlertType } from "@type/hollow";
import { hollow } from "hollow";
import { createSignal, For, JSX, onMount, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";

const alertTypes: Record<string, (props: any) => JSX.Element> = {
	success: CheckSquareOutlineIcon,
	error: XSquareOutlineIcon,
	warning: AlertTriangleOutlineIcon,
	info: AlertSquareOutlineIcon,
};

export default function Alerts() {
	const [alerts, setAlerts] = createSignal<(AlertType & { id: string })[]>(
		[],
	);
	const [cue, setCue] = createSignal([]);

	const addAlert = (alert: AlertType) => {
		const uniqueAlert = { ...alert, id: crypto.randomUUID() };
		setAlerts((prev) => [uniqueAlert, ...prev]);
		setCue((prev) => [...prev, uniqueAlert.id]);
		setTimeout(() => {
			setCue((prev) => [...prev.filter((i) => i !== uniqueAlert.id)]);
			setTimeout(() => {
				setAlerts((prev) =>
					prev.filter((i) => i.id !== uniqueAlert.id),
				);
			}, 4000);
			alert.onTimeOut && alert.onTimeOut();
		}, alert.duration ?? 3000);
	};

	onMount(() => {
		hollow.events.on("alert", addAlert);
	});

	return (
		<Show when={alerts().length > 0}>
			<div class="pointer-events-none fixed top-4 right-4 z-10 box-border flex h-full w-fit flex-col items-end gap-2">
				<For each={alerts()}>
					{(alert) => {
						const Icon = alert.type && alertTypes[alert.type];
						return (
							<Presence>
								<Show when={cue().includes(alert.id)}>
									<Motion.div
										initial={{ x: "100%" }}
										animate={{ x: 0 }}
										exit={{ x: "110%" }}
										transition={{ duration: 0.4 }}
										class="border-secondary-10 bg-secondary-05 pointer-events-auto relative w-fit overflow-hidden rounded-lg border"
									>
										<div
											class="flex items-center gap-2 pl-3"
											classList={{
												"px-3": !alert.button,
											}}
										>
											<Show when={alert.type}>
												<Icon class="size-5" />
											</Show>
											<Show when={alert.title}>
												<h1>{alert.title}</h1>
											</Show>
											<Show when={alert.message}>
												<span class="py-2 text-neutral-500">
													{alert.message}
												</span>
											</Show>
											<Show when={alert.button}>
												<button
													class="border-secondary-10 hover:bg-secondary-10 ml-2 border-l px-3 py-2 transition-colors"
													onclick={
														alert.button.callback
													}
												>
													{alert.button.label}
												</button>
											</Show>
										</div>
										<hr
											class="bg-secondary-20 timer-bar absolute bottom-0 h-[2px] border-0"
											style={{
												"--duration": `${alert.duration ?? 3000}ms`,
											}}
										/>
									</Motion.div>
								</Show>
							</Presence>
						);
					}}
				</For>
			</div>
		</Show>
	);
}
