import { Achievement, Character } from "@app/type/Character";
import { AccountState, Events } from "./types";
import DEFAULT from "@assets/configs/character.json?raw";

// We'll use this for the default state if not provided
const defaultState: AccountState = JSON.parse(DEFAULT);

export function accountReducer(
	state: AccountState = defaultState,
	action: Events,
): AccountState {
	if (action.domain !== "account") return state;

	switch (action.type) {
		case "set-user":
			const { character, ...rest } = action.user;
			return { ...state, user: rest, character };
		case "set-connection": {
			return { ...state, connection: action.connection };
		}
		case "add-achievement": {
			const achievements = state.character.achievements || [];
			if (achievements.some((a) => action.achievement.id === a.id)) {
				return state;
			}
			return {
				...state,
				character: {
					...state.character,
					achievements: [...achievements, action.achievement],
				},
			};
		}

		case "add-xp": {
			let { xp = 0, total = 1 } = state.character.level;
			xp += action.amount;
			let lvlAmount = 0;
			while (xp >= (total + lvlAmount) * 100) {
				xp -= (total + lvlAmount) * 100;
				lvlAmount++;
			}

			const newState: AccountState = {
				...state,
				character: {
					...state.character,
					level: { ...state.character.level, xp },
				},
			};
			if (lvlAmount > 0) {
				newState.character.level.total = total + lvlAmount;
			}
			return newState;
		}

		case "update-identity": {
			return {
				...state,
				character: {
					...state.character,
					identity: {
						...state.character.identity,
						[action.key]: action.value,
					},
				},
			};
		}

		case "set-meta": {
			const meta = state.character.meta || [];
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
				character: { ...state.character, meta: newMeta },
			};
		}

		case "remove-meta": {
			const meta = state.character.meta || [];
			return {
				...state,
				character: {
					...state.character,
					meta: meta.filter((i) => i.id !== action.id),
				},
			};
		}
		case "add-title": {
			if (state.character.titles.some((i) => i.id === action.title.id)) {
				return state;
			}
			return {
				...state,
				character: {
					...state.character,
					titles: [...state.character.titles, action.title],
				},
			};
		}
		case "update-title": {
			return {
				...state,
				character: {
					...state.character,
					title: state.character.titles.find(
						(i) => i.id === action.id,
					),
				},
			};
		}

		default:
			return state;
	}
}
