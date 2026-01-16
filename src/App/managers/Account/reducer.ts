import { Character } from "@type/Character";
import { CharacterState, Events } from "./types";
import DEFAULT from "@assets/configs/character.json?raw";

// We'll use this for the default state if not provided
const defaultState: CharacterState = JSON.parse(DEFAULT);

export function accountReducer(
	state: CharacterState = defaultState,
	action: Events,
): CharacterState {
	if (action.domain !== "account") return state;

	switch (action.type) {
		case "add-achievement": {
			const achievements = state.achievements || [];
			if (achievements.includes(action.achievement)) {
				return state;
			}
			return {
				...state,
				achievements: [...achievements, action.achievement],
			};
		}

		case "add-xp": {
			let { xp = 0, level = 1 } = state;
			xp += action.amount;
			let lvlAmount = 0;
			while (xp >= (level + lvlAmount) * 100) {
				xp -= (level + lvlAmount) * 100;
				lvlAmount++;
			}

			const newState = { ...state, xp };
			if (lvlAmount > 0) {
				newState.level = level + lvlAmount;
			}
			return newState;
		}

		case "level-up": {
			const amount = action.amount ?? 1;
			return {
				...state,
				level: (state.level || 1) + amount,
			};
		}

		case "update-field": {
			return {
				...state,
				[action.key]: action.value,
			};
		}

		case "set-meta": {
			const meta = state.meta || [];
			const idx = meta.findIndex((m) => m.id === action.props.id);
			const newMeta = [...meta];
			if (idx >= 0) {
				newMeta[idx] = { ...newMeta[idx], ...action.props };
			} else {
				// @ts-ignore
				newMeta.push(action.props);
			}
			return {
				...state,
				meta: newMeta,
			};
		}

		case "remove-meta": {
			const meta = state.meta || [];
			return {
				...state,
				meta: meta.filter((i) => i.id !== action.id),
			};
		}

		default:
			return state;
	}
}
