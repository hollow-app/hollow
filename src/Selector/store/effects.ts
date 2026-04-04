import { Action, RootState } from "./types";
import { realmEffects, setupRealm } from "../managers/Realm";
import { DispatchType } from ".";

export let _dispatch: (action: Action) => void;
export let _state: () => RootState;
export function runEffects(action: Action, state: RootState) {
	const results = [realmEffects(action as any, state.realm)];

	const promises = results.filter(
		(e): e is Promise<void> => e instanceof Promise,
	);

	return promises.length > 0
		? Promise.all(promises).then(() => {})
		: Promise.resolve();
}

export async function setupEffects(
	dispatch: DispatchType,
	getState: () => RootState,
) {
	_dispatch = dispatch;
	_state = getState;
	await setupRealm(dispatch);
}
