import { PluginsProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import { Motion, Presence } from "solid-motionone";
import { Show } from "solid-js";
import { For } from "solid-js";
import {
	ChevronLeftIcon,
	ShieldAlertIcon,
	ShieldCheckIcon,
} from "lucide-solid";
import { Suspense } from "solid-js";
import PluginPreview from "./PluginPreview";

export const PluginsView = (
	state: StateType,
	logic: LogicType,
	props: PluginsProps,
	helper?: HelperType,
) => {
	return (
		<Presence exitBeforeEnter>
			<Show when={!state.selectedPlugin()}>
				<Motion.div
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
					class="flex flex-col p-10 text-neutral-950 dark:text-neutral-100"
				>
					<div class="flex justify-between">
						<h1 class="text-4xl font-bold">Plugins</h1>
						<div class="flex items-center">
							<p>Enable Unverified Plugins</p>
							<div class="toggle-switch">
								<input
									class="toggle-input"
									id="enable-unverified-toggle"
									type="checkbox"
									checked={state.unverified()}
									onclick={logic.switchUnverified}
								/>
								<label
									class="toggle-label"
									for="enable-unverified-toggle"
								></label>
							</div>
						</div>
					</div>
					<input
						class="input my-5"
						style={{
							"--bg-color": "var(--secondary-color-10)",
							"--bg-color-f": "var(--secondary-color-15)",
						}}
						placeholder="Search"
					/>
					<div class="grid flex-1 grid-cols-[1fr_1fr_1fr] overflow-hidden overflow-y-scroll">
						<Show when={state.plugins()}>
							<For
								each={state
									.plugins()
									.filter(
										(i) => state.unverified() || i.verified,
									)}
							>
								{(plugin) => (
									<PluginPreview
										plugin={plugin}
										setSelectedPlugin={
											state.setSelectedPlugin
										}
										setSelectedMD={state.setSelectedMD}
									/>
								)}
							</For>
						</Show>
					</div>
				</Motion.div>
			</Show>
			<Show when={state.selectedPlugin()}>
				<Motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
					class="flex h-full flex-col p-10 text-neutral-950 dark:text-neutral-100"
				>
					<div class="mb-5 flex justify-between">
						<div class="flex">
							<button
								class="hover:bg-secondary-10 my-auto mr-5 h-full rounded p-2"
								onclick={() => state.setSelectedPlugin(null)}
							>
								<ChevronLeftIcon class="size-7" />
							</button>

							<h1 class="text-5xl font-bold">
								{state.selectedPlugin().name}
							</h1>
						</div>
						<div class="bg-secondary-10 rounded p-3">
							{state.selectedPlugin().verified ? (
								<ShieldCheckIcon class="text-green-600" />
							) : (
								<ShieldAlertIcon class="text-yellow-600" />
							)}
						</div>
					</div>
					<div class="flex h-fit w-full justify-between">
						<div class="grid w-fit grid-cols-[auto_auto] font-mono">
							<p class="text-secondary-40">Author</p>
							<p>{state.selectedPlugin().author}</p>
							<p class="text-secondary-40">Version</p>
							<p>{state.selectedPlugin().version}</p>
							<p class="text-secondary-40 pr-5">Description</p>
							<p>{state.selectedPlugin().desc}</p>
						</div>
					</div>
					<div class="flex items-end justify-between">
						<a
							class="text-secondary-50 hover:text-secondary-90 cursor-pointer text-sm underline"
							target="_blank"
							href={`https://github.com/${state.selectedPlugin().repo}`}
						>
							Source Code
						</a>

						<button class="button-primary" onclick={logic.action}>
							{(() => {
								const installed =
									state.selectedPlugin().installed;
								return installed
									? "Uninstall"
									: installed === null
										? "In-Process"
										: "Install";
							})()}
						</button>
					</div>
					<div class="bg-secondary-10/50 mt-5 box-border w-full flex-1 overflow-hidden overflow-y-scroll rounded-xl p-5">
						<Suspense
							fallback={
								<div class="flex h-full w-full items-center justify-center">
									<div class="chaotic-orbit" />
								</div>
							}
						>
							<div
								class="markdown-preview"
								innerHTML={state.selectedMD()}
							/>
						</Suspense>
					</div>
				</Motion.div>
			</Show>
		</Presence>
	);
};
