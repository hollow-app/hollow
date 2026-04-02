import { LayoutState, LayoutEvents, LayoutVariant } from "./types";

const defaultState: LayoutState = {
	left: {
		visible: false,
		current: "expand",
		panels: ["expand", "account"],
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
			const variant = state[action.variant];
			if (variant.panels.includes(action.id)) return state;
			return {
				...state,
				[action.variant]: {
					...variant,
					panels: [...variant.panels, action.id],
				},
			};
		}
		case "remove-panel": {
			const variant = state[action.variant];
			return {
				...state,
				[action.variant]: {
					...variant,
					panels: variant.panels.filter((id) => id !== action.id),
					current:
						variant.current === action.id
							? undefined
							: variant.current,
				},
			};
		}
		case "select-panel": {
			const variant = state[action.variant];
			// Toggle off if already visible and selected
			if (variant.current === action.id && variant.visible) {
				return {
					...state,
					[action.variant]: {
						...variant,
						visible: false,
					},
				};
			}
			return {
				...state,
				[action.variant]: {
					...variant,
					current: action.id,
					visible: true,
				},
			};
		}
		case "toggle-panel": {
			const variant = state[action.variant];
			return {
				...state,
				[action.variant]: {
					...variant,
					visible: !variant.visible,
				},
			};
		}
		case "set-visibility": {
			const variant = state[action.variant];
			return {
				...state,
				[action.variant]: {
					...variant,
					visible: action.visible,
				},
			};
		}
		default:
			return state;
	}
}
