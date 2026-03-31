import { Events, AccountState } from "./types";
import { hollow } from "../../../hollow";
import { Auth } from "../../../lib/auth";
import { RootState } from "@shared/store/types";

export async function setupAccount(
	dispatch: (action: any) => void,
	get: () => RootState,
) {
	const request = await Auth.getUser();
	if (request && request.user) {
		const { user, kind } = request;
		dispatch({
			domain: "account",
			type: "set-user",
			user: user,
		});
		dispatch({
			domain: "account",
			type: "set-connection",
			connection: { state: true, type: kind },
		});
	} else {
		dispatch({
			domain: "account",
			type: "set-connection",
			connection: { state: false, type: "offline" },
		});
	}
}
// });

export function accountEffects(action: Events, state: AccountState) {
	if (action.domain !== "account") return;
	switch (action.type) {
		case "add-achievement":
			hollow.events.emit("alert", {
				title: "Achievement Gained",
				message: action.achievement.label,
			});
			saveInDb(state);
			break;
		case "add-xp":
			saveInDb(state);
			break;
		case "add-title":
			saveInDb(state);
			break;
		case "update-title":
			saveInDb(state);
			break;
		case "update-identity":
			saveInDb(state);
			break;
		case "set-meta":
			break;
		case "remove-meta":
			break;
	}
}
function saveInDb(state: AccountState) {
	localStorage.setItem(
		"user",
		JSON.stringify({ user: { ...state.user, character: state.character } }),
	);
}
