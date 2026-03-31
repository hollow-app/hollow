import { ContextEvents, ContextState } from "./type";

const initialState: ContextState = {
	tags: [],
	isFocus: false,
	isLiveEditor: false,
	canvasConfigs: {
		disableResize: true,
		disableDrag: true,
		float: true,
		column: 12,
		cellHeight: 100,
	},
	isSettingsVisible: false,
	isVaultVisible: undefined,
};

export function contextReducer(
	state: ContextState = initialState,
	action: ContextEvents,
): ContextState {
	if (action.domain !== "context") return state;

	switch (action.type) {
		case "set-tags":
			return { ...state, tags: action.tags };
		case "set-focus":
			return { ...state, isFocus: action.focus };
		case "set-canvas-configs":
			return { ...state, canvasConfigs: action.configs };
		case "toggle-live-editor":
			return {
				...state,
				canvasConfigs: {
					disableDrag: !state.canvasConfigs.disableDrag,
					disableResize: !state.canvasConfigs.disableResize,
				},
				isLiveEditor: !state.isLiveEditor,
			};
		case "toggle-settings":
			return {
				...state,
				isSettingsVisible: action.value ?? !state.isSettingsVisible,
			};
		case "toggle-vault":
			return {
				...state,
				isVaultVisible:
					action.value ?? (state.isVaultVisible ? undefined : {}),
			};
		case "edit-instance":
			return { ...state, editorInstance: action.instance };
		default:
			return state;
	}
}
