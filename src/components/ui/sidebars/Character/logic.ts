import { CharacterProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { hollow } from "hollow";
import { manager } from "@managers/index";

export type LogicType = {
	import_image: (key: string) => Promise<void>;
};

export const CharacterLogic = (
	state: StateType,
	props: CharacterProps,
	helper?: HelperType,
): LogicType => {
	const import_image = async (key: string) => {
		hollow.events.emit("show-vault", {
			onSelect: (image: string) => {
				state.setCharacter((prev) => ({ ...prev, [key]: image }));
				manager.character.set = { [key]: image };
			},
		});
	};
	return { import_image };
};
