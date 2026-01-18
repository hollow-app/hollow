import { LayoutState, LayoutEvents, PanelType } from "./types";

const defaultState: LayoutState = {
	left: {
		visible: false,
		current: "expand",
		panels: ["expand", "character"],
	},
	right: {
		visible: false,
		current: "editor",
		panels: ["editor", "notifications"],
	},
};

export function layoutReducer(
	state: LayoutState = defaultState,
	action: LayoutEvents,
): LayoutState {
	if (action.domain !== "layout") return state;

	switch (action.type) {
		case "add-panel": {
			const side = state[action.side];
			if (side.panels.includes(action.id)) return state;
			return {
				...state,
				[action.side]: {
					...side,
					panels: [...side.panels, action.id],
				},
			};
		}
		case "remove-panel": {
			const side = state[action.side];
			return {
				...state,
				[action.side]: {
					...side,
					panels: side.panels.filter((id) => id !== action.id),
					current:
						side.current === action.id ? undefined : side.current,
				},
			};
		}
		case "select-panel": {
			const side = state[action.side];
			// Toggle off if already visible and selected
			if (side.current === action.id && side.visible) {
				return {
					...state,
					[action.side]: {
						...side,
						visible: false,
					},
				};
			}
			return {
				...state,
				[action.side]: {
					...side,
					current: action.id,
					visible: true,
				},
			};
		}
		case "toggle-panel": {
			const side = state[action.side];
			return {
				...state,
				[action.side]: {
					...side,
					visible: !side.visible,
				},
			};
		}
		case "set-visibility": {
			const side = state[action.side];
			return {
				...state,
				[action.side]: {
					...side,
					visible: action.visible,
				},
			};
		}
		default:
			return state;
	}
}
