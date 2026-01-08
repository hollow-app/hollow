import {
	ArrowDownUpIcon,
	BadgeInfoIcon,
	FileCodeIcon,
	FileSlidersIcon,
	HousePlugIcon,
	KeyboardIcon,
	OrbitIcon,
	PaletteIcon,
	PandaIcon,
} from "lucide-solid";
import { Accessor, createSignal, Setter, Show, Suspense } from "solid-js";
import HollowIcon from "@assets/logo.svg";

import { Motion, Presence } from "solid-motionone";
import General from "./settings/General";
import { lazy } from "solid-js";
import { manager } from "@managers/index";
import { GridStackOptions } from "gridstack";

const Plugins = lazy(() => import("./settings/Plugins"));
const Modifier = lazy(() => import("./settings/Modifier"));
const HotKeys = lazy(() => import("./settings/HotKeys"));
const Developers = lazy(() => import("./settings/Developers"));
const Appearance = lazy(() => import("./settings/Appearance"));
const About = lazy(() => import("./settings/About"));
const Account = lazy(() => import("./settings/Character"));

type SettingsProps = {
	setSettings: Setter<boolean>;
	selected?: number;
};
export default function Settings(props: SettingsProps) {
	const [selected, setSelected] = createSignal(0);

	return (
		<div
			class="pop-up"
			style={{
				"--animation": "none",
			}}
		>
			<div
				class="up-pop flex h-[calc(90%-calc(var(--spacing)*11))] w-[80%]"
				style={{
					"--bg-color": "var(--color-secondary)",
				}}
			>
				<div class="flex h-full w-full">
					<div class="bg-secondary-10/30 box-border flex h-full w-[25%] flex-col justify-between px-5 pt-5 pb-10">
						<div class="flex flex-col gap-2">
							<div class="bg-secondary-10 mb-5 box-border flex overflow-hidden rounded px-3 py-5">
								<HollowIcon class="fill-primary orbit my-auto mr-2 size-12 shrink-0 transition-transform duration-300" />
								<div class="flex min-w-0 flex-1 flex-col">
									<h1 class="my-auto text-xl font-bold text-neutral-950 dark:text-neutral-50">
										{manager.realm.getCurrent().name} Realm
									</h1>
									<div class="flex flex-1">
										<p class="text-secondary-50 max-w-[50%] overflow-hidden text-sm text-ellipsis whitespace-nowrap">
											{manager.realm.currentRealmId}
										</p>
									</div>
								</div>
								<button
									class="button-control my-auto ml-auto shrink-0"
									onclick={() => manager.realm.toggleRealm()}
								>
									<ArrowDownUpIcon class="m-auto" />
								</button>
							</div>
							<button
								onClick={() => setSelected(0)}
								class="hover:bg-secondary-10 flex h-fit w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-bold hover:text-neutral-950 active:scale-[99%] dark:hover:text-neutral-50"
								classList={{
									"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50":
										selected() === 0,
									"text-neutral-700 dark:text-neutral-400":
										selected() !== 0,
								}}
							>
								<OrbitIcon /> General
							</button>
							<button
								onClick={() => setSelected(1)}
								class="hover:bg-secondary-10 flex h-fit w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-bold hover:text-neutral-950 active:scale-[99%] dark:hover:text-neutral-50"
								classList={{
									"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50":
										selected() === 1,
									"text-neutral-700 dark:text-neutral-400":
										selected() !== 1,
								}}
							>
								<PaletteIcon />
								Appearance
							</button>
							<button
								onClick={() => setSelected(2)}
								class="hover:bg-secondary-10 flex h-fit w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-bold hover:text-neutral-950 active:scale-[99%] dark:hover:text-neutral-50"
								classList={{
									"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50":
										selected() === 2,
									"text-neutral-700 dark:text-neutral-400":
										selected() !== 2,
								}}
							>
								<HousePlugIcon /> Plugins
							</button>
							<hr class="border-secondary bg-secondary-10/50 mx-auto h-[2px] w-full" />
							<button
								onClick={() => setSelected(3)}
								class="hover:bg-secondary-10 flex h-fit w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-bold hover:text-neutral-950 active:scale-[99%] dark:hover:text-neutral-50"
								classList={{
									"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50":
										selected() === 3,
									"text-neutral-700 dark:text-neutral-400":
										selected() !== 3,
								}}
							>
								<KeyboardIcon /> HotKeys
							</button>
							<button
								onClick={() => setSelected(4)}
								class="hover:bg-secondary-10 flex h-fit w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-bold hover:text-neutral-950 active:scale-[99%] dark:hover:text-neutral-50"
								classList={{
									"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50":
										selected() === 4,
									"text-neutral-700 dark:text-neutral-400":
										selected() !== 4,
								}}
							>
								<FileSlidersIcon /> Modifier
							</button>

							<button
								onClick={() => setSelected(5)}
								class="hover:bg-secondary-10 flex h-fit w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-bold hover:text-neutral-950 active:scale-[99%] dark:hover:text-neutral-50"
								classList={{
									"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50":
										selected() === 5,
									"text-neutral-700 dark:text-neutral-400":
										selected() !== 5,
								}}
							>
								<FileCodeIcon />
								Developers
							</button>

							<button
								onClick={() => setSelected(6)}
								class="hover:bg-secondary-10 flex h-fit w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-bold hover:text-neutral-950 active:scale-[99%] dark:hover:text-neutral-50"
								classList={{
									"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50":
										selected() === 6,
									"text-neutral-700 dark:text-neutral-400":
										selected() !== 6,
								}}
							>
								<PandaIcon />
								Character
							</button>
							<button
								onClick={() => setSelected(7)}
								class="hover:bg-secondary-10 flex h-fit w-full items-center gap-4 rounded-lg px-3 py-2 text-lg font-bold hover:text-neutral-950 active:scale-[99%] dark:hover:text-neutral-50"
								classList={{
									"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50":
										selected() === 7,
									"text-neutral-700 dark:text-neutral-400":
										selected() !== 7,
								}}
							>
								<BadgeInfoIcon />
								About
							</button>
						</div>
						<button
							class="button secondary"
							style={{ "--w": "100%" }}
							onclick={() => props.setSettings(false)}
							tabIndex={-1}
						>
							Close
						</button>
					</div>
					<div class="relative h-full flex-1 overflow-hidden overflow-y-scroll">
						<Presence exitBeforeEnter>
							<Show when={selected() === 0}>
								<Motion.div
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									class="h-full"
								>
									<Suspense>
										<General />
									</Suspense>
								</Motion.div>
							</Show>
							<Show when={selected() === 1}>
								<Motion.div
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									class="h-full"
								>
									<Suspense>
										<Appearance />
									</Suspense>
								</Motion.div>
							</Show>
							<Show when={selected() === 2}>
								<Motion.div
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									class="h-full"
								>
									<Suspense>
										<Plugins />
									</Suspense>
								</Motion.div>
							</Show>
							<Show when={selected() === 3}>
								<Motion.div
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									class="h-full"
								>
									<Suspense>
										<HotKeys />
									</Suspense>
								</Motion.div>
							</Show>
							<Show when={selected() === 4}>
								<Motion.div
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									class="h-full"
								>
									<Suspense>
										<Modifier />
									</Suspense>
								</Motion.div>
							</Show>
							<Show when={selected() === 5}>
								<Motion.div
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									class="h-full"
								>
									<Suspense>
										<Developers />
									</Suspense>
								</Motion.div>
							</Show>
							<Show when={selected() === 6}>
								<Motion.div
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									class="h-full"
								>
									<Suspense>
										<Account />
									</Suspense>
								</Motion.div>
							</Show>
							<Show when={selected() === 7}>
								<Motion.div
									initial={{
										opacity: 0,
									}}
									animate={{
										opacity: 1,
									}}
									exit={{
										opacity: 0,
									}}
									transition={{
										duration: 0.3,
									}}
									class="h-full"
								>
									<Suspense>
										<About />
									</Suspense>
								</Motion.div>
							</Show>
						</Presence>
					</div>
				</div>
			</div>
		</div>
	);
}
