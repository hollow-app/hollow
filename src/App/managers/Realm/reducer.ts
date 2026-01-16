import { Events, RealmState } from "./type";

const defaultState: RealmState = null;

export function realmReducer(
	state: RealmState = defaultState,
	action: Events,
): RealmState {
	if (action.domain !== "realm") return state;

	switch (action.type) {
		case "set-realm":
			return action.realm;
		case "update-colors":
			if (!state) return state;
			return {
				...state,
				colors: { ...state.colors, ...action.colors },
			};
		default:
			return state;
	}
}
