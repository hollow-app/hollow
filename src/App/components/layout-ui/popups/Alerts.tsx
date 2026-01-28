import CheckSquareOutlineIcon from "@assets/icons/check-square-outline.svg";
import XSquareOutlineIcon from "@assets/icons/x-square-outline.svg";
import AlertTriangleOutlineIcon from "@assets/icons/alert-triangle-outline.svg";
import AlertSquareOutlineIcon from "@assets/icons/alert-square-outline.svg";
import LoaderIcon from "@assets/icons/loader.svg";
import { AlertType } from "@type/hollow";
import { hollow } from "../../../../hollow";
import {
	createMemo,
	createSignal,
	For,
	JSX,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { XIcon } from "lucide-solid";
import { estimateReadingTimeMs } from "@utils/manipulation/strings";
import { Accessor } from "solid-js";

const alertTypes: Record<AlertType["type"], (props: any) => JSX.Element> = {
	success: CheckSquareOutlineIcon,
	error: XSquareOutlineIcon,
	warning: AlertTriangleOutlineIcon,
	info: AlertSquareOutlineIcon,
	loading: LoaderIcon,
};

export default function Alerts() {
	const [alerts, setAlerts] = createSignal<(AlertType & { id: string })[]>(
		[],
	);
	const items = createMemo(() => alerts().map((i) => i.id));
	const [cue, setCue] = createSignal([]);

	const addAlert = async (alert: AlertType) => {
		const id = crypto.randomUUID();
		const uniqueAlert = { ...alert, id };
		setAlerts((prev) => [uniqueAlert, ...prev]);
		setCue((prev) => [...prev, uniqueAlert.id]);
		const duration = estimateReadingTimeMs([
			alert.title ?? "",
			alert.message ?? "",
		]);
		if (alert.type !== "loading") {
			setTimeout(() => {
				setCue((prev) => [...prev.filter((i) => i !== id)]);
				setTimeout(() => {
					setAlerts((prev) => prev.filter((i) => i.id !== id));
				}, 4000);
				alert.onTimeOut && alert.onTimeOut();
			}, alert.duration ?? duration);
		} else {
			return {
				source: "source",
				callback: (alert: AlertType) => {
					setAlerts((p) =>
						p.map((i) => (i.id === id ? { ...i, ...alert } : i)),
					);
					setTimeout(() => {
						setCue((prev) => [...prev.filter((i) => i !== id)]);
						setTimeout(() => {
							setAlerts((prev) =>
								prev.filter((i) => i.id !== id),
							);
						}, 4000);
						alert.onTimeOut && alert.onTimeOut();
					}, alert.duration ?? duration);
				},
			};
		}
	};

	const dismiss = (id: string) => {
		setCue((prev) => prev.filter((i) => i !== id));
		setTimeout(() => {
			setAlerts((prev) => {
				const alertToDismiss = prev.find((a) => a.id === id);
				alertToDismiss.type !== "loading" &&
					alertToDismiss?.onTimeOut?.();
				return prev.filter((a) => a.id !== id);
			});
		}, 400);
	};
	onMount(() => {
		hollow.events.on("alert", addAlert);
	});

	onCleanup(() => {
		hollow.events.off("alert", addAlert);
	});
	return (
		<Show when={alerts().length > 0}>
			<div class="pointer-events-none fixed top-4 right-4 z-700 box-border flex h-full w-fit flex-col items-end gap-2">
				<For each={items()}>
					{(item) => {
						return (
							<Presence>
								<Show when={cue().includes(item)}>
									<Motion.div
										initial={{ x: "100%" }}
										animate={{ x: 0 }}
										exit={{ x: "110%" }}
										transition={{ duration: 0.4 }}
										class="border-secondary-10 bg-secondary-05 pointer-events-auto relative w-fit overflow-hidden rounded-lg border"
									>
										{(() => {
											const alert = createMemo((i) =>
												alerts().find(
													(i) => i.id === item,
												),
											);
											return (
												<NormalAlert
													alert={alert}
													dismiss={() =>
														dismiss(item)
													}
												/>
											);
										})()}
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

const NormalAlert = (props: {
	alert: Accessor<AlertType>;
	dismiss: () => void;
}) => {
	const [hovered, setHovered] = createSignal(false);
	return (
		<>
			<div
				class="flex flex-col gap-0 px-3 py-2 text-sm"
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
			>
				<div class="flex items-center gap-2">
					<Show when={props.alert().type}>
						<Show
							when={
								!hovered() || props.alert().type === "loading"
							}
							fallback={
								<button
									class="button-control"
									style={{
										"--size": "calc(var(--spacing) * 5)",
									}}
									onclick={props.dismiss}
								>
									<XIcon class="size-4" />
								</button>
							}
						>
							<Show when={props.alert().type}>
								{(() => {
									const CurrentIcon =
										alertTypes[props.alert().type];
									return (
										<CurrentIcon
											class="size-5"
											classList={{
												"animate-spin":
													props.alert().type ===
													"loading",
											}}
										/>
									);
								})()}
							</Show>
						</Show>
					</Show>
					<Show when={props.alert().title}>
						<h1>{props.alert().title}</h1>
					</Show>
					<Show when={props.alert().button}>
						<button
							class="bg-secondary-10 active:bg-secondary-05 hover:bg-secondary-15 border-secondary-20 text-secondary-foreground hover:border-secondary-25 my-1 ml-auto h-fit rounded-md border px-2 py-1 text-xs transition-colors"
							onclick={props.alert().button.callback}
						>
							{props.alert().button.label}
						</button>
					</Show>
				</div>
				<Show when={props.alert().message}>
					<p class="max-w-120 text-neutral-500">
						{props.alert().message}
					</p>
				</Show>
			</div>
			<Show when={props.alert().type !== "loading"}>
				<hr
					class="bg-secondary-20 timer-bar absolute bottom-0 h-[2px] border-0"
					style={{
						"--duration": `${props.alert().duration ?? 3000}ms`,
					}}
				/>
			</Show>
		</>
	);
};
