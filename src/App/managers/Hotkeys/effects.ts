import { Events, HotkeysState } from "./type";
import { HotKeyName } from "@type/HotKeyType";
import { hollow } from "../../../hollow";
import { defaultState } from "./reducer";
import { reload } from "@rust";
import { toggleRealm } from "@shared/managers/Realm";

let dispatch: ((action: any) => void) | null = null;
let globalListener: ((e: KeyboardEvent) => void) | null = null;
const events: Partial<Record<HotKeyName, () => void>> = {};

export function setupHotkeys(d: (action: any) => void) {
	dispatch = d;
	const savedData = localStorage.getItem("hotkeys");
	let parsedData: HotkeysState;
	if (savedData) {
		parsedData = JSON.parse(savedData);
	} else {
		parsedData = defaultState;
		localStorage.setItem("hotkeys", JSON.stringify(parsedData));
	}

	dispatch({
		domain: "hotkeys",
		type: "set-hotkeys",
		hotkeys: parsedData.hotkeys,
		configuration: parsedData.configuration,
	});

	initializeHotkeys(parsedData);
}

export async function hotkeysEffects(action: Events, state: HotkeysState) {
	if (action.domain !== "hotkeys") return;

	// Sync to local storage
	if (
		[
			"set-hotkeys",
			"set-hotkey",
			"reset-defaults",
			"toggle-enabled",
		].includes(action.type)
	) {
		localStorage.setItem("hotkeys", JSON.stringify(state));
		initializeHotkeys(state);
	}

	switch (action.type) {
		case "execute-hotkey":
			executeHotkey(action.name);
			break;
	}
}

function initializeHotkeys(state: HotkeysState) {
	if (globalListener) {
		window.removeEventListener("keydown", globalListener);
		globalListener = null;
	}

	globalListener = (e: KeyboardEvent) => {
		if (!state.configuration.enabled) return;

		const pressedKeys = getPressedKeys(e);

		for (const hotkey of state.hotkeys) {
			const hotkeyKeys = hotkey.keys.map((k) => k.toLowerCase());
			if (areKeysMatching(pressedKeys, hotkeyKeys)) {
				e.preventDefault();
				executeHotkey(hotkey.name);
				break;
			}
		}
	};

	if (state.configuration.enabled) {
		window.addEventListener("keydown", globalListener);
	}
}

function getPressedKeys(e: KeyboardEvent): string[] {
	const keys: string[] = [];
	if (e.ctrlKey) keys.push("ctrl");
	if (e.altKey) keys.push("alt");
	if (e.shiftKey) keys.push("shift");
	if (e.metaKey) keys.push("meta");

	const key = e.key.toLowerCase();
	if (!["ctrl", "alt", "shift", "meta"].includes(key)) {
		keys.push(key);
	}

	return keys;
}

function areKeysMatching(pressed: string[], required: string[]): boolean {
	if (pressed.length !== required.length) return false;

	return required.every((key) => {
		if (key === "[1-9]") {
			return /^[1-9]$/.test(pressed[pressed.length - 1]);
		}
		return pressed.includes(key.toLowerCase());
	});
}

export function executeHotkey(name: HotKeyName) {
	switch (name) {
		case "Reload App":
			reload();
			break;
		case "Toggle Vault":
			hollow.events.toggle("show-vault");
			break;
		case "Go to Realm Selector":
			toggleRealm();
			break;
		default:
			try {
				events[name]?.();
			} catch (e) {
				console.log(e);
			}
			break;
	}
}

export function registerHotkeyEvent(name: HotKeyName, callback: () => void) {
	events[name] = callback;
}
