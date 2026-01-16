import { ModuleState } from "./type";
import { Events } from "./type";
import { CardType } from "@type/hollow";

const defaultState: ModuleState = {
	instances: [],
};

export function moduleReducer(
	state: ModuleState = defaultState,
	action: Events,
): ModuleState {
	if (action.domain !== "module") return state;

	switch (action.type) {
		case "set-instances":
			return { ...state, instances: action.instances };
		case "uninstall-module":
			return {
				...state,
				instances: state.instances.filter(
					(i) => i.data.tool !== action.name,
				),
			};
		case "add-instance": {
			if (state.instances.some((i) => i.data.name === action.name)) {
				return state;
			}
			const id = "node-" + crypto.randomUUID();
			const newCard: CardType = {
				id,
				w: 3,
				h: 4,
				style: {
					"border-radius": "10px",
					"--opacity": "100%",
					"border-color": "#3d3d3d",
					"border-width": "0px",
					background:
						"color-mix(in oklab, var(--front) var(--opacity), transparent)",
				},
				data: {
					name: action.name,
					emoji: action.emoji,
					isPlaced: false,
					isFavored: false,
					CreatedDate: new Date().toISOString(),
					tool: action.toolName,
				},
			};
			return {
				...state,
				instances: [...state.instances, newCard],
			};
		}
		case "remove-instance":
			return {
				...state,
				instances: state.instances.filter(
					(i) => !action.cardIds.includes(i.id),
				),
			};
		case "update-instance":
			return {
				...state,
				instances: state.instances.map((card) =>
					card.id === action.cardId
						? {
								...card,
								...action.rect,
								data: {
									...card.data,
									...action.updates,
								},
							}
						: card,
				),
			};
		case "toggle-instance":
			return {
				...state,
				instances: state.instances.map((c) =>
					c.id === action.id
						? {
								...c,
								data: {
									...c.data,
									isPlaced: !c.data.isPlaced,
								},
							}
						: c,
				),
			};
		case "change-emoji":
			return {
				...state,
				instances: state.instances.map((c) =>
					c.id === action.cardId
						? {
								...c,
								data: {
									...c.data,
									emoji: action.emoji,
								},
							}
						: c,
				),
			};
		case "update-instances": {
			const updatesMap = new Map<string, CardType>();
			action.cardsToUpdate.forEach(({ cards }) => {
				cards.forEach((c) => updatesMap.set(c.id, c));
			});

			return {
				...state,
				instances: state.instances.map((c) =>
					updatesMap.has(c.id) ? updatesMap.get(c.id)! : c,
				),
			};
		}
		default:
			return state;
	}
}
