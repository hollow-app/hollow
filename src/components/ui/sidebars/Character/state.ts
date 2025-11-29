import { Accessor, createSignal, onMount, Setter } from "solid-js";
import { CharacterProps } from ".";
import type { HelperType } from "./helper";
import { Character } from "@type/Character";
import { hollow } from "hollow";
import { CharacterManager } from "@managers/CharacterManager";

export type StateType = {
	character: Accessor<Character>;
	setCharacter: Setter<Character>;
};

export const createCharacterState = (
	props: CharacterProps,
	helper?: HelperType,
): StateType => {
	const [character, setCharacter] = createSignal<Character>(null);

	onMount(() => {
		hollow.pevents.on("ui-set-character", (c) =>
			setCharacter((prev) => ({ ...prev, ...c })),
		);
		setCharacter(CharacterManager.getSelf().getCharacter());
	});
	return { character, setCharacter };
};
