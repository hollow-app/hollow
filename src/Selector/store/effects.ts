import { Action, RootState } from "./types";
import { realmEffects, setupRealm } from "../managers/Realm";

export function runEffects(action: Action, state: RootState) {
	realmEffects(action as any, state.realm);
}

export function setupEffects(dispatch: (action: Action) => void) {
	setupRealm(dispatch);
}
