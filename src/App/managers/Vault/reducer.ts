import { Events, VaultState } from "./type";

const defaultState: VaultState = {
    items: [],
};

export function vaultReducer(
    state: VaultState = defaultState,
    action: Events,
): VaultState {
    if (action.domain !== "vault") return state;

    switch (action.type) {
        case "set-items":
            return {
                ...state,
                items: action.items,
            };
        case "add-items":
            return {
                ...state,
                items: [...state.items, ...action.items],
            };
        case "remove-items":
            return {
                ...state,
                items: state.items.filter(
                    (i) => !action.paths.includes(i.path),
                ),
            };
        case "edit-item":
            return {
                ...state,
                items: state.items.map((i) =>
                    i.url === action.editedParts.url
                        ? { ...i, ...action.editedParts }
                        : i,
                ),
            };
        default:
            return state;
    }
}
