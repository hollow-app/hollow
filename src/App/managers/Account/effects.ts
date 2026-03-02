import { Events, AccountState } from "./types";
import { hollow } from "../../../hollow";
import { get_user, is_signed_in, sign_out } from "@rust";
import { RootState } from "@shared/store/types";

export function setupAccount(
	dispatch: (action: any) => void,
	get: () => RootState,
) {
	// const connection = await is_signed_in();
	dispatch({
		domain: "account",
		type: "set-connection",
		connection: { state: true, type: "online" },
	});
	// const user = await get_user();
	// localStorage.user = JSON.stringify(user);
	if (localStorage.user) {
		dispatch({
			domain: "account",
			type: "set-user",
			user: JSON.parse(localStorage.user)["user"],
		});
		return;
	}
	// if (connection.state) {
	// 	const user = await get_user();
	// 	if (user) {
	// 		localStorage.user = JSON.stringify(user);
	// 	}
	// 	dispatch({ domain: "account", type: "set-user", user });
	// }
	// hollow.events.on("network-state", async (b) => {
	// 	const accountState = get().account;
	// 	if (!accountState.connection.state) return;
	// 	if (b && accountState.connection.type === "offline") {
	// 		const connection = await is_signed_in();
	// 		dispatch({
	// 			domain: "account",
	// 			type: "set-connection",
	// 			connection,
	// 		});
	// 		// todo
	// 		// user as well;
	// 	}
	// });
}

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
