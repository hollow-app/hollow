import { Accessor, createMemo } from "solid-js";
import { hollow } from "../../../../../hollow";
import { Character } from "@type/Character";
import { useStore } from "store";

export interface CharacterProps {}

export interface CharacterState {
	character: Accessor<Character | null>;
}

export interface CharacterActions {
	import_image: (key: string) => Promise<void>;
}

export interface CharacterHook {
	state: CharacterState;
	actions: CharacterActions;
}

export const useCharacter = (): CharacterHook => {
	const { state, dispatch } = useStore();
	const character = createMemo(() => state.account);

	const import_image = async (key: "banner" | "avatar") => {
		hollow.events.emit("show-vault", {
			onSelect: (image: string) => {
				dispatch({
					domain: "account",
					type: "update-field",
					key,
					value: image,
				});
			},
		});
	};

	return {
		state: {
			character,
		},
		actions: {
			import_image,
		},
	};
};
