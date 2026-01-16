import { CodeThemeState, Events } from "./types";

const initialState: CodeThemeState = {
	currentTheme: "default",
	db: null,
};

export function codeThemeReducer(
	state: CodeThemeState = initialState,
	action: Events,
): CodeThemeState {
	if (action.domain !== "code-theme") return state;

	switch (action.type) {
		case "set-theme":
			return { ...state, currentTheme: action.name };
		default:
			return state;
	}
}
