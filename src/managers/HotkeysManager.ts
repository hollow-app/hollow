import { HotKeyType } from "@type/HotKeyType";
import { RustManager } from "@managers/RustManager";
type HotKeysData = {
	configuration: {
		enabled: boolean;
	};
	hotkeys: HotKeyType[];
};
export class hotkeysManager {
	private hotkeys: HotKeyType[];
	private key: string;
	private enabled: boolean = false;
	private globalListener: ((e: KeyboardEvent) => void) | null = null;
	public events: { [name: string]: () => void } = {};

	constructor() {
		this.key = `${window.realmManager.currentRealmId}-keys`;
		const savedData = localStorage.getItem(this.key);
		let parsedData: HotKeysData;
		if (savedData) {
			parsedData = JSON.parse(savedData);
		} else {
			parsedData = iniData;
			localStorage.setItem(this.key, JSON.stringify(parsedData));
		}
		this.hotkeys = parsedData.hotkeys;
		this.enabled = parsedData.configuration.enabled;
		this.initializeHotkeys();
	}

	public getHotKeys = () => this.hotkeys;

	public setHotKey(newSet: HotKeyType) {
		if (!this.validateHotkeys(newSet)) {
			throw new Error("Invalid hotkey configuration");
		}
		if (
			this.hotkeys.some((k) =>
				k.keys.every((i, index) => newSet.keys[index] === i),
			)
		) {
			return;
		}
		this.hotkeys = this.hotkeys.map((i) =>
			i.name === newSet.name ? newSet : i,
		);
		this.update();
		this.initializeHotkeys();
	}

	public resetToDefaults() {
		this.hotkeys = [...iniData.hotkeys];
		this.update();
		this.initializeHotkeys();
	}

	public toggle(state: boolean) {
		this.enabled = state;
		if (state) {
			window.addEventListener("keydown", this.globalListener);
		} else {
			window.removeEventListener("keydown", this.globalListener);
		}
		this.update();
	}

	public isEnabled() {
		return this.enabled;
	}

	private validateHotkeys(hotkey: HotKeyType): boolean {
		const keyCombinations = new Set<string>();

		if (!hotkey.name || !hotkey.keys || !hotkey.type) {
			return false;
		}

		const keyCombo = hotkey.keys.sort().join("+");
		if (keyCombinations.has(keyCombo)) {
			return false;
		}
		keyCombinations.add(keyCombo);

		for (const key of hotkey.keys) {
			if (!this.isValidKey(key)) {
				return false;
			}
		}
		return true;
	}

	private isValidKey(key: string): boolean {
		const validModifiers = ["ctrl", "alt", "shift", "meta"];
		const validSpecialKeys = [
			"enter",
			"escape",
			"tab",
			"backspace",
			"delete",
		];

		if (/^\[1-9\]$/.test(key)) return true;

		if (key.length === 1 && /^[a-zA-Z0-9]$/.test(key)) return true;

		return (
			validModifiers.includes(key.toLowerCase()) ||
			validSpecialKeys.includes(key.toLowerCase())
		);
	}

	private initializeHotkeys() {
		if (this.globalListener) {
			window.removeEventListener("keydown", this.globalListener);
			this.globalListener = null;
		}

		this.globalListener = (e: KeyboardEvent) => {
			if (!this.enabled) return;

			const pressedKeys = this.getPressedKeys(e);

			for (const hotkey of this.hotkeys) {
				// if (hotkey.static) continue;

				const hotkeyKeys = hotkey.keys.map((k) => k.toLowerCase());
				if (this.areKeysMatching(pressedKeys, hotkeyKeys)) {
					e.preventDefault();
					this.executeHotkey(hotkey);
					break;
				}
			}
		};

		this.enabled && window.addEventListener("keydown", this.globalListener);
	}

	private getPressedKeys(e: KeyboardEvent): string[] {
		const keys: string[] = [];
		if (e.ctrlKey) keys.push("ctrl");
		if (e.altKey) keys.push("alt");
		if (e.shiftKey) keys.push("shift");
		if (e.metaKey) keys.push("meta");

		const key = e.key.toLowerCase();
		if (!["control", "alt", "shift", "meta"].includes(key)) {
			keys.push(key);
		}

		return keys;
	}

	private areKeysMatching(pressed: string[], required: string[]): boolean {
		if (pressed.length !== required.length) return false;

		return required.every((key) => {
			if (key === "[1-9]") {
				return /^[1-9]$/.test(pressed[pressed.length - 1]);
			}
			return pressed.includes(key.toLowerCase());
		});
	}

	private executeHotkey(hotkey: HotKeyType) {
		switch (hotkey.name) {
			case "Reload App":
				RustManager.getSelf().reload();
				break;
			case "Toggle Entries Viewer":
				window.hollowManager.emit("show-entries");
				break;
			case "Toggle Placement":
				break;
			case "Go to Realm Selector":
				window.realmManager.toggleRealm();
				break;
			default:
				// the ones that are custom from the outside
				try {
					this.events[hotkey.name]();
				} catch (e) {
					console.log(e);
				}
				break;
		}
	}

	private update() {
		const data: HotKeysData = {
			configuration: {
				enabled: this.enabled,
			},
			hotkeys: this.hotkeys,
		};
		localStorage.setItem(this.key, JSON.stringify(data));
	}
}

const iniData: HotKeysData = {
	configuration: {
		enabled: false,
	},
	hotkeys: [
		{
			name: "Go to Realm Selector",
			keys: ["Alt", "Shift", "R"],
			description: "Open the realm selection menu",
			type: "Navigation",
			static: true,
		},

		{
			name: "Toggle Drag and Drop Mode",
			keys: ["Ctrl", "D"],
			description: "Switch between dnd and normal mode",
			type: "Card Controls",
		},
		{
			name: "Toggle Settings",
			keys: ["Ctrl", ","],
			description: "Open or close the settings",
			type: "View Controls",
		},
		{
			name: "Toggle Notifications",
			keys: ["Ctrl", "N"],
			description: "Open or close the notifications",
			type: "View Controls",
		},
		{
			name: "Toggle Expand",
			keys: ["Ctrl", "E"],
			description: "Expand or collapse the left sidebar",
			type: "View Controls",
		},
		{
			name: "Toggle Entries Viewer",
			keys: ["Ctrl", "F"],
			description: "Show or hide the entries viewer",
			type: "View Controls",
		},
		{
			name: "Accept Confirm Message",
			keys: ["Enter"],
			description: "Confirm and accept the current warning dialog",
			type: "System Controls",
		},
		{
			name: "Refuse Confirm Message",
			keys: ["Escape"],
			description: "Dismiss and deny the current warning dialog",
			type: "System Controls",
		},
		{
			name: "Reload App",
			keys: ["Ctrl", "R"],
			description: "Refresh and reload the application",
			static: true,
			type: "System Controls",
		},
	],
};
