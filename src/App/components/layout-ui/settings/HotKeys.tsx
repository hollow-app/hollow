import { HotKeyType } from "@app/type/HotKeyType";
import { FeatherIcon } from "lucide-solid";
import {
	createSignal,
	For,
	Show,
	onMount,
	onCleanup,
	createMemo,
} from "solid-js";
import { useStore } from "@store";
import { SettingsGroup, SettingsItem } from "@ui";
import SettingsPanel from "./SettingsPanel";
const KEY_MAP: Record<string, string> = {
	Control: "ctrl",
	Alt: "alt",
	Shift: "shift",
	Meta: "meta",
	ArrowLeft: "left",
	ArrowRight: "right",
	ArrowUp: "up",
	ArrowDown: "down",
	" ": "space",
	Enter: "enter",
	Escape: "esc",
	Backspace: "backspace",
};
export default function HotKeys() {
	const { state, dispatch } = useStore();
	const conf = createMemo(() => state.hotkeys.configuration);
	const [target, setTarget] = createSignal(null);
	const [currentKeys, setCurrentKeys] = createSignal<string[]>([]);

	const handleEnabled = (e: Event & { currentTarget: HTMLInputElement }) => {
		const stateM = e.currentTarget.checked;
		dispatch({
			domain: "hotkeys",
			type: "toggle-enabled",
			enabled: stateM,
		});
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (target()) {
			e.preventDefault();
			const key = KEY_MAP[e.key] ?? e.key.toLowerCase(); // normalize

			if (!currentKeys().includes(key)) {
				setCurrentKeys((prev) => [...prev, key]);
			}
		}
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		if (target() && currentKeys().length > 0) {
			const t = target();
			const targetHotkey = state.hotkeys.hotkeys.find(
				(i) => i.name === t,
			);
			if (targetHotkey) {
				const updatedHotkey = {
					...targetHotkey,
					keys: [...currentKeys()],
				};
				dispatch({
					domain: "hotkeys",
					type: "set-hotkey",
					hotkey: updatedHotkey,
				});
			}

			setCurrentKeys([]);
			setTarget(null);
		}
	};
	const grouped = createMemo(() =>
		Object.values(
			state.hotkeys.hotkeys.reduce(
				(acc, item) => {
					(acc[item.type] ||= {
						type: item.type,
						items: [],
					}).items.push(item);
					return acc;
				},
				{} as Record<string, { type: string; items: HotKeyType[] }>,
			),
		),
	);

	onMount(() => {
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
	});

	onCleanup(() => {
		window.removeEventListener("keydown", handleKeyDown);
		window.removeEventListener("keyup", handleKeyUp);
	});

	return (
		<SettingsPanel>
			<div class="space-y-8">
				<SettingsGroup title="Configuration">
					<SettingsItem
						title="Enabled"
						description="Enable or disable the hotkeys."
					>
						<div class="toggle-switch">
							<input
								class="toggle-input"
								id="enable-hotkeys-toggle"
								type="checkbox"
								checked={conf().enabled}
								onChange={handleEnabled}
							/>
							<label
								class="toggle-label"
								for="enable-hotkeys-toggle"
							></label>
						</div>
					</SettingsItem>
				</SettingsGroup>
				<For each={grouped()}>
					{(group, i) => {
						return (
							<SettingsGroup title={group.type}>
								<For each={group.items}>
									{(key, index) => (
										<SettingsItem
											title={key.name}
											description={key.description}
										>
											<div class="bg-secondary-10/70 flex h-fit w-70 items-center justify-between rounded py-1 pr-1 pl-3 text-sm">
												<div class="flex gap-2">
													<Show
														when={
															target() ===
															key.name
														}
														fallback={
															<For
																each={
																	key.keys
																}
															>
																{(k) => (
																	<span class="keyboard-button">
																		{k}
																	</span>
																)}
															</For>
														}
													>
														<Show
															when={
																currentKeys().length >
																0
															}
															fallback={
																<span class="text-neutral-500 italic dark:text-neutral-400">
																	Press
																	keys...
																</span>
															}
														>
															<For
																each={currentKeys()}
															>
																{(k) => (
																	<span class="keyboard-button">
																		{k}
																	</span>
																)}
															</For>
														</Show>
													</Show>
												</div>
												<button
													class="button-control"
													onclick={(e) => {
														e.currentTarget.classList.toggle(
															"active",
														);
														setTarget((prev) =>
															prev
																? null
																: key.name,
														);
														setCurrentKeys([]);
													}}
													disabled={key.static}
												>
													<FeatherIcon />
												</button>
											</div>
										</SettingsItem>
									)}
								</For>
							</SettingsGroup>
						);
					}}
				</For>
			</div>
		</SettingsPanel>
	);
}
