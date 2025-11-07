import { RustManager } from "@managers/RustManager";
import { createResource, Suspense } from "solid-js";
import PatreonIcon from "@assets/icons/patreon.svg";
import { SettingsManager } from "@managers/SettingsManager";

export default function General() {
	const [version] = createResource(() => RustManager.getSelf().get_version());
	return (
		<div class="flex flex-col gap-5 p-10 text-neutral-950 dark:text-neutral-200">
			<div class="flex justify-between">
				<div class="flex h-fit w-full flex-col font-mono">
					<h1 class="text-3xl font-bold">Hollow</h1>
					<p class="text-secondary-50 text-xl">
						<Suspense fallback={"Beta"}>{version()}</Suspense>
					</p>
				</div>
				<div>
					<a
						class="button-secondary flex"
						href={"https://www.patreon.com/c/hollow_app"}
						target="_blank"
					>
						<PatreonIcon class="size-5" />
					</a>
				</div>
			</div>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-lg font-bold">Auto Update</h1>
					<p class="text-secondary-60 text-sm">
						Note: this feature is not supported yet.
					</p>
				</div>
				<div class="toggle-switch">
					<input
						class="toggle-input"
						id="auto-update-toggle"
						type="checkbox"
						disabled
					/>
					<label
						class="toggle-label"
						for="auto-update-toggle"
					></label>
				</div>
			</div>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<div class="flex items-center justify-between">
				<h1 class="text-lg font-bold">
					Select a Realm each time the app opens.
				</h1>

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
		</div>
	);
}
