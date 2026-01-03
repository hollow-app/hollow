import { manager } from "@managers/index";
import { createResource, Suspense } from "solid-js";
import { HeartHandshakeIcon, RefreshCwIcon } from "lucide-solid";
import { guide } from "@utils/help";

export default function General() {
	const [version] = createResource(() => manager.rust.get_version());
	const checkUpdates = async (
		e: Event & { currentTarget: HTMLButtonElement },
	) => {
		e.currentTarget.classList.add("debounce");
		await manager.hollow.checkUpdate(true, () => {
			e.currentTarget.classList.remove("debounce");
		});
	};
	const startTour = () => {
		manager.hotkeys.executeHotkey("Toggle Settings");
		guide();
	};
	const login = () => {};
	return (
		<div class="flex flex-col gap-5 p-10 text-neutral-950 dark:text-neutral-200">
			<div class="flex justify-between">
				<div class="flex h-fit w-full flex-col font-mono">
					<h1 class="text-3xl font-bold">Hollow</h1>
					<p class="text-secondary-50 text-xl">
						<Suspense fallback={"Beta"}>{version()}</Suspense>
					</p>
				</div>
				<a
					class="button secondary flex"
					style={{ "--h": "auto" }}
					href={"buymeacoffee.com/ryusufe"}
					target="_blank"
				>
					<HeartHandshakeIcon class="my-auto size-6" />
				</a>
			</div>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-lg font-bold">Auto Update</h1>
					<p class="text-sm text-neutral-600 dark:text-neutral-400">
						Automatically downloads and installs new versions in the
						background so you always stay up to date.
					</p>
				</div>
				<div class="flex items-center justify-center">
					<button
						class="button-control tool-tip"
						onclick={checkUpdates}
					>
						<span class="tool-tip-content" data-side="left">
							Check Update
						</span>
						<RefreshCwIcon />
					</button>
					<div class="toggle-switch">
						<input
							class="toggle-input"
							id="auto-update-toggle"
							type="checkbox"
							disabled
							checked={JSON.parse(
								localStorage.autoUpdate ?? "true",
							)}
							onchange={(e) =>
								(localStorage.autoUpdate = JSON.stringify(
									e.currentTarget.checked,
								))
							}
						/>
						<label
							class="toggle-label"
							for="auto-update-toggle"
						></label>
					</div>
				</div>
			</div>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-lg font-bold">
						Select a Realm each time the app opens.
					</h1>

					<p class="text-sm text-neutral-600 dark:text-neutral-400">
						Prompts you to choose which realm to connect to every
						time Hollow starts.
					</p>
				</div>
				<div class="toggle-switch">
					<input
						class="toggle-input"
						type="checkbox"
						id="choose-realm-toggle"
						checked={JSON.parse(
							localStorage.realmToggleOnStartup ?? "false",
						)}
						onchange={(e) =>
							(localStorage.realmToggleOnStartup = JSON.stringify(
								e.currentTarget.checked,
							))
						}
					/>
					<label
						class="toggle-label"
						for="choose-realm-toggle"
					></label>
				</div>
			</div>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-lg font-bold">Account</h1>

					<p class="text-sm text-neutral-600 dark:text-neutral-400">
						Sign-in to your hollow account.
					</p>
				</div>
				<div>
					<button class="button secondary">Sign-in</button>
				</div>
			</div>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-lg font-bold">Start Tour</h1>

					<p class="text-sm text-neutral-600 dark:text-neutral-400">
						Learn how to navigate and use Hollow step by step.
					</p>
				</div>
				<div>
					<button class="button secondary" onclick={startTour}>
						Start
					</button>
				</div>
			</div>
		</div>
	);
}
