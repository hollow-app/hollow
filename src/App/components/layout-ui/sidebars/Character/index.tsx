import {
	Component,
	createSignal,
	For,
	Setter,
	Show,
	onCleanup,
} from "solid-js";
import {
	Check,
	ImageUpIcon,
	SettingsIcon,
	UserCogIcon,
	UserIcon,
	XIcon,
} from "lucide-solid";
import FetchedIcon from "@app/components/ui/FetchedIcon";
import { useCharacter, CharacterProps } from "./hooks";
import { useStore } from "@app/store";
import { getCurrentRealm } from "@app/managers/Settings/effects.ts";
import { Skeleton } from "./skeleton";
import { Tab, TabList, TabPanel, Tabs } from "@component/ui/Tabs";
import { Avatar, Button, Empty, RarityBadge } from "@ui";
import Segmented from "@component/ui/Segmented";

const CharacterSidebar: Component<CharacterProps> = (props) => {
	const store = useStore();
	const { state, actions } = useCharacter();

	return (
		<div class="flex h-full w-102 flex-col overflow-hidden">
			<Show
				when={
					state.account().connection?.state &&
					state.account().character
				}
				fallback={
					<div class="mt-30 flex h-full w-full gap-3">
						<Empty.Root>
							<Empty.Icon icon={"user"} />
							<Empty.Title>You’re Not Signed In</Empty.Title>
							<Empty.Description>
								Sign in to access your account, save your
								progress, and enjoy all features. If you don’t
								have an account yet, you can create one in just
								a few steps.
							</Empty.Description>
						</Empty.Root>
					</div>
				}
			>
				<div class="group border-secondary-05 relative h-32 w-full overflow-hidden rounded-xl border">
					<Show when={state.account().character.identity.banner}>
						<img
							src={state.account().character.identity.banner}
							alt="Character banner"
							class="h-full w-full object-cover"
						/>
					</Show>
				</div>
				{/* Avatar Section */}
				<div class="relative flex-1 px-6 pb-6">
					<div class="-mt-12 flex justify-start">
						<Avatar user={state.account().character} />
					</div>
					<Button.Root
						class="absolute top-2 right-0"
						variant="ghost"
						onclick={() =>
							store.dispatch({
								domain: "context",
								type: "toggle-settings",
								value: "account:account",
							})
						}
						icon
					>
						<UserCogIcon class="size-4" />
					</Button.Root>
					{/* Character Info */}
					<div class="pointer-events-auto mt-4 space-y-4 text-left">
						<div class="space-y-1">
							<h2 class="text-2xl font-bold tracking-tight">
								{state.account().character.identity.name}
							</h2>
							<Show when={state.account().character?.title}>
								<RarityBadge
									title={state.account().character.title}
									displayLabel
								/>
							</Show>
						</div>
						<div class="text-sm text-gray-400">
							<span class="text-secondary-50">Realm:</span>{" "}
							<span class="text-secondary-95 pl-2">
								{getCurrentRealm()?.name}
							</span>
						</div>
						{/* XP Progress */}
						<Show
							when={
								state.account().character.level.xp !== undefined
							}
						>
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span class="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
										Experience
									</span>
									<span class="text-xs font-medium text-neutral-500">
										{state.account().character.level.xp} XP
									</span>
								</div>
								<div class="bg-secondary-10 h-1.5 overflow-hidden rounded-full">
									<hr
										class="from-primary-30 to-primary h-full border-0 bg-linear-to-r"
										style={{
											width: `${state.account().character.level.xp / state.account().character.level.total}%`,
										}}
									/>
								</div>
							</div>
						</Show>
						{/* Bio */}
						<p class="text-sm leading-relaxed text-neutral-500">
							{state.account().character.identity.bio}
						</p>
						{/* Mrta */}
						{/* <Show */}
						{/* 	when={ */}
						{/* 		state.account().character && */}
						{/* 		state.account().character!.meta?.length > 0 */}
						{/* 	} */}
						{/* > */}
						{/* 	<div class="space-y-3"> */}
						{/* 		<h3 class="text-sm font-semibold text-neutral-600 dark:text-neutral-400"> */}
						{/* 			Meta */}
						{/* 		</h3> */}
						{/**/}
						{/* 		<Show */}
						{/* 			when={state */}
						{/* 				.account() */}
						{/* 				.character.meta?.some( */}
						{/* 					(i) => typeof i.value === "number", */}
						{/* 				)} */}
						{/* 		> */}
						{/* 			<For */}
						{/* 				each={state */}
						{/* 					.account() */}
						{/* 					.character.meta?.filter( */}
						{/* 						(i) => */}
						{/* 							typeof i.value === "number", */}
						{/* 					)} */}
						{/* 			> */}
						{/* 				{(m) => ( */}
						{/* 					<ProgressBar */}
						{/* 						{...{ */}
						{/* 							...m, */}
						{/* 							value: () => */}
						{/* 								m.value as number, */}
						{/* 						}} */}
						{/* 					/> */}
						{/* 				)} */}
						{/* 			</For> */}
						{/* 		</Show> */}
						{/* 		<div class="flex flex-wrap gap-2"> */}
						{/* 			<Show */}
						{/* 				when={state */}
						{/* 					.account() */}
						{/* 					.character.meta?.some( */}
						{/* 						(i) => */}
						{/* 							typeof i.value === "string", */}
						{/* 					)} */}
						{/* 			> */}
						{/* 				<For */}
						{/* 					each={state */}
						{/* 						.account() */}
						{/* 						.character.meta?.filter( */}
						{/* 							(i) => */}
						{/* 								typeof i.value === */}
						{/* 								"string", */}
						{/* 						)} */}
						{/* 				> */}
						{/* 					{(m) => { */}
						{/* 						return ( */}
						{/* 							<div class="bg-secondary-10 flex w-fit items-center gap-1 rounded px-2 py-1"> */}
						{/* 								<Show when={m.icon}> */}
						{/* 									<FetchedIcon */}
						{/* 										class={"size-4"} */}
						{/* 										url={m.icon!} */}
						{/* 									/> */}
						{/* 								</Show> */}
						{/* 								<Show when={m.label}> */}
						{/* 									<span class="text-secondary-40 text-sm font-medium uppercase"> */}
						{/* 										{m.label} */}
						{/* 									</span> */}
						{/* 								</Show> */}
						{/* 								<span class="text-xs"> */}
						{/* 									{m.value} */}
						{/* 								</span> */}
						{/* 							</div> */}
						{/* 						); */}
						{/* 					}} */}
						{/* 				</For> */}
						{/* 			</Show> */}
						{/* 		</div> */}
						{/* 	</div> */}
						{/* </Show> */}
						{/* Achievements */}
						<Show
							when={
								state.account().character?.achievements &&
								state.account().character!.achievements.length >
									0
							}
						>
							<div class="space-y-3">
								<h3 class="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
									Achievements
								</h3>
								<div class="flex flex-wrap gap-2">
									<For
										each={state
											.account()
											.character.achievements.slice(
												0,
												10,
											)}
									>
										{(achievement) => (
											<div class="bg-secondary-10 rounded-md px-2 py-1 text-xs">
												{achievement.label}
											</div>
										)}
									</For>
									<Show
										when={
											state.account().character!
												.achievements.length > 10
										}
									>
										<div class="bg-secondary-10 rounded-md px-2 py-1 text-xs">
											+
											{state.account().character!
												.achievements.length - 10}
										</div>
									</Show>
								</div>
							</div>
						</Show>
					</div>
				</div>
			</Show>
		</div>
	);
};

type ProgressBarProps = {
	id: string;
	label?: string;
	icon?: string;
	color?: string;
	value: () => number;
};

function ProgressBar({
	id,
	label,
	icon,
	color,
	value: initialValue,
}: ProgressBarProps) {
	const { dispatch } = useStore();
	const [value, setValue] = createSignal(initialValue());
	const [isDragging, setIsDragging] = createSignal(false);
	let barRef!: HTMLDivElement;

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging()) return;
		const rect = barRef.getBoundingClientRect();
		let newPercent = ((e.clientX - rect.left) / rect.width) * 100;
		newPercent = Math.min(100, Math.max(0, newPercent));
		setValue(newPercent);
	};

	const handleMouseUp = () => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	};

	const handleMouseDown = (
		e: MouseEvent & { currentTarget: HTMLDivElement },
	) => {
		setIsDragging(true);
		// @ts-ignore
		if (!e.target.closest("button")) {
			handleMouseMove(e);
		}
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const onCancel = () => {
		setIsDragging(false);
		setValue(initialValue());
	};

	const onApply = () => {
		dispatch({
			domain: "account",
			type: "set-meta",
			props: { id, value: value() },
		});
		setIsDragging(false);
	};

	onCleanup(() => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	});

	return (
		<div class="relative flex items-center gap-2">
			<div class="bg-secondary-10 flex items-center gap-1 rounded p-1">
				<Show when={icon}>
					<FetchedIcon
						class={"size-4"}
						style={{ color: color }}
						url={icon!}
					/>
				</Show>
				<Show when={label}>
					<h3 class="text-sm font-medium text-neutral-700 uppercase dark:text-neutral-300">
						{label}
					</h3>
				</Show>
			</div>

			{/* Progress bar */}
			<div
				ref={barRef}
				class="bg-secondary-10 relative h-1.5 flex-1 cursor-pointer rounded-full"
				title={`${value().toFixed(0)}%`}
				onMouseDown={handleMouseDown}
			>
				<hr
					class="h-full rounded-tl-full rounded-bl-full border-0"
					style={{
						width: `${value()}%`,
						background: `linear-gradient(to right, color-mix(in oklab, transparent, ${color}), ${color})`,
					}}
				/>

				{/* Floating Save / Cancel */}
				<Show when={isDragging()}>
					<div class="absolute -top-8 right-0 flex gap-1">
						<button
							class="button secondary"
							style={{ "--padding-x": "var(--padding-y)" }}
							onclick={onApply}
						>
							<Check class="size-4" />
						</button>
						<button
							class="button secondary"
							style={{ "--padding-x": "var(--padding-y)" }}
							onclick={onCancel}
						>
							<XIcon class="size-4" />
						</button>
					</div>
				</Show>
			</div>
		</div>
	);
}

export default CharacterSidebar;
