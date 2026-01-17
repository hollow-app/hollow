import { Events, RealmState } from "./type";

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
		case "set-state":
			return {
				...state,
				...action.state,
			};
		case "set-select-on-startup":
			return {
				...state,
				selectOnStartup: action.value,
			};
		case "enter-realm":
			return {
				...state,
				current: action.realmId,
			};
		case "add-realm":
			return {
				...state,
				realms: [...state.realms, action.realm],
			};
		case "remove-realm": {
			const newRealms = state.realms.filter(
				(i) => i.id !== action.realmId,
			);
			return {
				...state,
				realms: newRealms,
				current:
					state.current === action.realmId ? null : state.current,
			};
		}
		case "update-colors": {
			const currentRealmId = state.current;
			if (!currentRealmId) return state;

			const newRealms = state.realms.map((r) => {
				if (r.id === currentRealmId) {
					return {
						...r,
						colors: { ...r.colors, ...action.colors },
					};
				}
				return r;
			});

			return {
				...state,
				realms: newRealms,
			};
		}
		case "toggle-realm":
			// State update happens in effect after confirmation?
			// Or we just clear current here?
			// The original code clears current in the onAccept callback.
			// So we probably shouldn't update state here unless we want to reflect "switching".
			// But for now, let's leave it to effects to dispatch a state update if needed,
			// or actually, the original code sets current to null in store.
			return state;
		default:
			return state;
	}
}
