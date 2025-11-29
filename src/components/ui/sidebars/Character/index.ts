import { createModule } from "@utils/module";
import { createCharacterState } from "./state";
import type { StateType } from "./state";
import { CharacterLogic } from "./logic";
import type { LogicType } from "./logic";
import { CharacterView } from "./view";
import { CharacterHelper } from "./helper";
import type { HelperType } from "./helper";
import { Accessor } from "solid-js";

export type CharacterProps = {};

const Character = createModule<
	StateType,
	LogicType,
	CharacterProps,
	HelperType
>({
	create: (props: CharacterProps) => {
		const helper = CharacterHelper(props);
		const state = createCharacterState(props, helper);
		const logic = CharacterLogic(state, props, helper);

		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: CharacterProps,
				helper: HelperType,
			) => CharacterView(state, logic, props, helper),
		};
	},
});

export default Character;
