import { createSignal, onMount } from "solid-js";
import { hollow } from "hollow";
import { open } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { useStore } from "store";
import { reload } from "../../../../Hollow/rust";
import { getCurrentRealm } from "@managers/Realm";
import { openPath } from "@tauri-apps/plugin-opener";

// jk
export default function Developers() {
	const { state, dispatch } = useStore();
	const [options, setOption] = createSignal<{
		devtools: boolean;
		loadunsigned: boolean;
	}>({
		devtools: state.settings["enable-dev-tools"],
		loadunsigned: state.settings["load-unsigned-plugins"],
	});

	const changeDevtools = (e: Event & { currentTarget: HTMLInputElement }) => {
		const state = e.currentTarget.checked;
		// manager.rust.devtools_status({ state: state });
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
				reload();
			},
		});
	};
	const update = () => {
		dispatch({
			domain: "settings",
			type: "set-configs",
			configs: {
				"enable-dev-tools": options().devtools,
				"load-unsigned-plugins": options().loadunsigned,
			},
		});
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
									await openPath(
										await join(
											...[
												getCurrentRealm().location,
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
