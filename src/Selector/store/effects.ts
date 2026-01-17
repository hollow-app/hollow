import { Action, RootState } from "./types";
import { realmEffects, setupRealm } from "../managers/Realm";

export function runEffects(action: Action, state: RootState) {
	const results = [realmEffects(action as any, state.realm)];

	const promises = results.filter((r) => r instanceof Promise);
	if (promises.length > 0) {
		return Promise.all(results).then((res) => res.find((r) => r !== undefined));
	}

	return results.find((r) => r !== undefined);
}

export function setupEffects(dispatch: (action: Action) => void) {
	setupRealm(dispatch);
}
