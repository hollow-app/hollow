import { RootState, Action } from "./types";
import { realmReducer } from "../managers/Realm";

export function rootReducer(
	state: RootState | undefined,
	action: Action,
): RootState {
	return {
		realm: realmReducer(state.realm, action as any),
	};
}
