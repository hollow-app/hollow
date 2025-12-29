import { Accessor, createSignal, onCleanup, onMount, Setter } from "solid-js";
import { CharacterProps } from ".";
import type { HelperType } from "./helper";
import { Character } from "@type/Character";
import { manager } from "@managers/index";

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
		const unsub = manager.character.subscribe(
			(v) => {
				setCharacter({ ...v });
			},
			{ now: true },
		);
		onCleanup(() => {
			unsub();
		});
	});
	return { character, setCharacter };
};
