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
		default:
			return state;
	}
}
