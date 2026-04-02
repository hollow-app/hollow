import {
	createEffect,
	createResource,
	createSignal,
	Show,
	Suspense,
} from "solid-js";
import { HeartHandshakeIcon, RefreshCwIcon, UserIcon } from "lucide-solid";
import { guide } from "@app/utils/help";
import { executeHotkey } from "@app/managers/Hotkeys";
import { get_version, sign_in, sign_out } from "@rust";
import {
	selectRealmOnStartup,
	setSelectRealmOnStartup,
} from "@shared/managers/Realm";
import { checkUpdate } from "../../../../lib/app";
import { Button, SettingsItem } from "@ui";
import { useStore } from "@shared/store";
import SettingsPanel from "./SettingsPanel";

export default function General() {
	const [version] = createResource(() => get_version());
	const checkUpdates = async (
		e: Event & { currentTarget: HTMLButtonElement },
	) => {
		// TODO use <Button's loading
		e.currentTarget.classList.add("debounce");
		await checkUpdate(true, () => {
			e.currentTarget.classList.remove("debounce");
		});
	};
	const startTour = () => {
		executeHotkey("Toggle Settings");
		guide();
	};
	return (
		<SettingsPanel>
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
					href={"https://buymeacoffee.com/ryusufe"}
					target="_blank"
				>
					<HeartHandshakeIcon class="my-auto size-6" />
				</a>
			</div>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<SettingsItem
				title="Auto Update"
				description="Automatically downloads and installs new versions in the background so you always stay up to date."
			>
				<Button.Root
					variant="ghost"
					class="tool-tip"
					onClick={(e) => {
						checkUpdates(e);
					}}
				>
					<span class="tool-tip-content" data-side="left">
						Check Update
					</span>
					<RefreshCwIcon />
				</Button.Root>
				<div class="toggle-switch">
					<input
						class="toggle-input"
						id="auto-update-toggle"
						type="checkbox"
						disabled
						checked={JSON.parse(localStorage.autoUpdate ?? "true")}
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
			</SettingsItem>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<SettingsItem
				title="Initial Realm Selection"
				description="Prompts you to choose which realm to connect to every time Hollow starts."
			>
				<div class="toggle-switch">
					<input
						class="toggle-input"
						type="checkbox"
						id="choose-realm-toggle"
						checked={selectRealmOnStartup()}
						onchange={(e) => {
							const value = e.currentTarget.checked;
							setSelectRealmOnStartup(value);
						}}
					/>
					<label
						class="toggle-label"
						for="choose-realm-toggle"
					></label>
				</div>
			</SettingsItem>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<SettingsItem
				title="Start Tour"
				description="Learn how to navigate and use Hollow step by step."
			>
				<button class="button secondary" onclick={startTour}>
					Start
				</button>
			</SettingsItem>
		</SettingsPanel>
	);
}
