import { Events, RealmState } from "./types";

const defaultState: RealmState = {
    current: null,
    realms: [],
    selectOnStartup: false,
};

export function realmReducer(
    state: RealmState = defaultState,
    action: Events,
): RealmState {
    if (action.domain !== "realm") return state;

    switch (action.type) {
        case "load-realms": {
            // Load realms from storage: find current realm by ID
            const currentRealm =
                action.state.realms.find((r) => r.id === action.state.current) ||
                null;
            return {
                ...state,
                current: currentRealm,
                realms: action.state.realms,
                selectOnStartup: action.state.selectOnStartup,
            };
        }
        case "set-realm":
            return {
                ...state,
                current: action.realm,
            };
        case "add-realm":
            return {
                ...state,
                realms: [...state.realms, action.realm],
            };
        case "remove-realm": {
            const newRealms = state.realms.filter((i) => i.id !== action.realmId);
            return {
                ...state,
                realms: newRealms,
                current:
                    state.current?.id === action.realmId ? null : state.current,
            };
        }
        case "update-colors": {
            // Update colors for current realm
            if (!state.current) return state;

            const updatedCurrent = {
                ...state.current,
                colors: { ...state.current.colors, ...action.colors },
            };

            // Also update in realms list
            const newRealms = state.realms.map((r) =>
                r.id === state.current.id ? updatedCurrent : r,
            );

            return {
                ...state,
                current: updatedCurrent,
                realms: newRealms,
            };
        }
        case "set-select-on-startup":
            return {
                ...state,
                selectOnStartup: action.value,
            };
        case "enter-realm": {
            // Set realm as current and update lastEntered
            const realm = state.realms.find((r) => r.id === action.realmId);
            if (!realm) return state;

            const updatedRealm = {
                ...realm,
                lastEntered: new Date().toISOString(),
            };

            const newRealms = state.realms.map((r) =>
                r.id === action.realmId ? updatedRealm : r,
            );

            return {
                ...state,
                current: updatedRealm,
                realms: newRealms,
            };
        }
        default:
            return state;
    }
}
