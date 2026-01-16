import { Events, HotkeysState } from "./type";
import { HotKeyType } from "@type/HotKeyType";

const iniData: HotkeysState = {
    configuration: {
        enabled: true,
    },
    hotkeys: [
        {
            name: "Go to Realm Selector",
            keys: ["alt", "shift", "r"],
            description: "Open the realm selection menu",
            type: "Navigation",
            static: true,
        },

        {
            name: "Toggle Drag and Drop Mode",
            keys: ["ctrl", "d"],
            description: "Switch between dnd and normal mode",
            type: "Card Controls",
        },
        {
            name: "Toggle Settings",
            keys: ["ctrl", ","],
            description: "Open or close the settings",
            type: "View Controls",
        },
        {
            name: "Toggle Notifications",
            keys: ["ctrl", "n"],
            description: "Open or close the notifications",
            type: "View Controls",
        },
        {
            name: "Toggle Editor",
            keys: ["ctrl", "i"],
            description: "Toggle the editor on the right sidebar",
            type: "View Controls",
        },
        {
            name: "Toggle Expand",
            keys: ["ctrl", "e"],
            description: "Expand or collapse the left sidebar",
            type: "View Controls",
        },
        {
            name: "Toggle Vault",
            keys: ["ctrl", "k"],
            description: "Toggle the vault storage.",
            type: "View Controls",
        },
        {
            name: "Accept Confirm Message",
            keys: ["enter"],
            description: "Confirm and accept the current warning dialog",
            type: "System Controls",
        },
        {
            name: "Refuse Confirm Message",
            keys: ["escape"],
            description: "Dismiss and deny the current warning dialog",
            type: "System Controls",
        },
        {
            name: "Reload App",
            keys: ["ctrl", "r"],
            description: "Refresh and reload the application",
            static: true,
            type: "System Controls",
        },
    ],
};

export const defaultState = iniData;

export function hotkeysReducer(
    state: HotkeysState = defaultState,
    action: Events,
): HotkeysState {
    if (action.domain !== "hotkeys") return state;

    switch (action.type) {
        case "set-hotkeys":
            return {
                ...state,
                hotkeys: action.hotkeys,
                configuration: action.configuration ?? state.configuration,
            };
        case "set-hotkey": {
            if (!validateHotkeys(action.hotkey)) {
                // Should ideally be handled before dispatch or throw error
                // But reducer must be pure. We'll just ignore invalid updates here
                // or assume validation happened in effects/caller.
                // However, the original code threw an error.
                // For now, let's assume valid.
                return state;
            }
            // Check for duplicates
            if (
                state.hotkeys.some((k) =>
                    k.keys.every((i, index) => action.hotkey.keys[index] === i),
                )
            ) {
                return state;
            }
            return {
                ...state,
                hotkeys: state.hotkeys.map((i) =>
                    i.name === action.hotkey.name ? action.hotkey : i,
                ),
            };
        }
        case "reset-defaults":
            return {
                ...state,
                hotkeys: [...iniData.hotkeys],
            };
        case "toggle-enabled":
            return {
                ...state,
                configuration: {
                    ...state.configuration,
                    enabled: action.enabled,
                },
            };
        default:
            return state;
    }
}

function validateHotkeys(hotkey: HotKeyType): boolean {
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
        if (!isValidKey(key)) {
            return false;
        }
    }
    return true;
}

function isValidKey(key: string): boolean {
    const validModifiers = ["ctrl", "alt", "shift", "meta"];
    const validSpecialKeys = [
        "enter",
        "escape",
        "tab",
        "backspace",
        "delete",
    ];

    if (/^\[1-9\]$/.test(key)) return true;

    if (key.length === 1) return true;

    return (
        validModifiers.includes(key.toLowerCase()) ||
        validSpecialKeys.includes(key.toLowerCase())
    );
}
