import { createSignal } from "solid-js";
import { RustManager } from "@managers/RustManager";
import { RealmManager } from "@managers/RealmManager";
import { SettingsManager } from "@managers/SettingsManager";
import { hollow } from "hollow";
import { BaseDirectory, open } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";

// jk
export default function Developers() {
	const [options, setOption] = createSignal<{
		devtools: boolean;
		loadunsigned: boolean;
	}>({ devtools: false, loadunsigned: false });

	// Load from SettingsManager
	(async () => {
		const devtools =
			SettingsManager.getSelf().getConfig("enable-dev-tools");
		const loadunsigned = SettingsManager.getSelf().getConfig(
			"load-unsigned-plugins",
		);
		setOption({ devtools, loadunsigned });
	})();

	const changeDevtools = (e: Event & { currentTarget: HTMLInputElement }) => {
		const state = e.currentTarget.checked;
		// RustManager.getSelf().devtools_status({ state: state });
		setOption((prev) => ({ ...prev, devtools: state }));
		update();
	};
	const changeUnsignedTools = (
		e: Event & { currentTarget: HTMLInputElement },
	) => {
		const state = e.currentTarget.checked;
		hollow.events.emit("confirm", {
			message: "This action requires the app to restart.",
			title: "Warning",
			onAccept: () => {
				setOption((prev) => ({
					...prev,
					loadunsigned: state,
				}));
				update();
				RustManager.getSelf().reload();
			},
		});
	};
	const update = () => {
		SettingsManager.getSelf().setConfig(
			"enable-dev-tools",
			options().devtools,
		);
		SettingsManager.getSelf().setConfig(
			"load-unsigned-plugins",
			options().loadunsigned,
		);
	};
	return (
		<div class="h-fit w-full p-10">
			<h1 class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				Developers
			</h1>
			{/*<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />*/}
			<div class="flex w-full flex-col gap-5 p-5 pb-9">
				<div class="flex justify-between">
					<div>
						<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
							Enable Dev Tools
						</h2>
						<p class="text-sm text-neutral-600 dark:text-neutral-400">
							Toggle to open browser dev tools or a debug console
							in the app.
						</p>
					</div>

					<div class="toggle-switch">
						<input
							class="toggle-input"
							id="dev-tools-toggle"
							type="checkbox"
							checked={options().devtools}
							onchange={changeDevtools}
						/>
						<label
							class="toggle-label"
							for="dev-tools-toggle"
						></label>
					</div>
				</div>
				<hr class="bg-secondary-10 h-px w-full border-0" />

				<div class="flex justify-between">
					<div>
						<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
							Load Unsigned Plugins
						</h2>
						<p class="text-sm text-neutral-600 dark:text-neutral-400">
							Allows you to load any plugin inside{" "}
							<span
								class="text-primary cursor-pointer underline"
								onclick={async () => {
									await open(
										await join(
											...[
												RealmManager.getSelf().getCurrent()
													.location,
												"plugins",
											],
										),
									);
								}}
							>
								Plugins Folder
							</span>
							.
						</p>
					</div>

					<div class="toggle-switch">
						<input
							class="toggle-input"
							id="load-unsigned-plugins-toggle"
							type="checkbox"
							checked={options().loadunsigned}
							onchange={changeUnsignedTools}
						/>
						<label
							class="toggle-label"
							for="load-unsigned-plugins-toggle"
						></label>
					</div>
				</div>
			</div>
		</div>
	);
}
