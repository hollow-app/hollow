import { HotKeyName, HotKeyType } from "@type/HotKeyType";

export type HotkeysState = {
    configuration: {
        enabled: boolean;
    };
    hotkeys: HotKeyType[];
};

export type Events =
    | { domain: "hotkeys" } & (
        | {
            type: "set-hotkeys";
            hotkeys: HotKeyType[];
            configuration?: { enabled: boolean };
        }
        | {
            type: "set-hotkey";
            hotkey: HotKeyType;
        }
        | {
            type: "reset-defaults";
        }
        | {
            type: "toggle-enabled";
            enabled: boolean;
        }
        | {
            type: "execute-hotkey";
            name: HotKeyName;
        }
    );
