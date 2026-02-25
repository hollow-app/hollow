import { ExtensionState } from "./type";
import { Events } from "./type";

const defaultState: ExtensionState = {
	instances: [],
};

export function extensionReducer(
	state: ExtensionState = defaultState,
	action: Events,
): ExtensionState {
	if (action.domain !== "extension") return state;

	switch (action.type) {
		default:
			return state;
	}
}
