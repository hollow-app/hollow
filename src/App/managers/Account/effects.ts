import { Events, CharacterState } from "./types";
import { hollow } from "hollow";

export function setupAccount(dispatch: (action: any) => void) {
	hollow.events.on("character-add-achievement", (achievement: string) => {
		dispatch({ domain: "account", type: "add-achievement", achievement });
	});

	hollow.events.on("character-add-xp", (amount: number) => {
		dispatch({ domain: "account", type: "add-xp", amount });
	});
}

export function accountEffects(action: Events, state: CharacterState) {
	if (action.domain !== "account") return;

	// Persistence
	// We save the entire character state to localStorage on any account action
	localStorage.setItem("character", JSON.stringify(state));

	// Specific side effects
	switch (action.type) {
		case "add-achievement":
			hollow.events.emit("alert", {
				title: "Achievement Gained",
				message: action.achievement,
			});
			break;
	}
}
