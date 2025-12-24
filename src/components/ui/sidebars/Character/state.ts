import { Accessor, createSignal, onCleanup, onMount, Setter } from "solid-js";
import { CharacterProps } from ".";
import type { HelperType } from "./helper";
import { Character } from "@type/Character";
import { hollow } from "hollow";
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
		hollow.pevents.on("ui-set-character", (c) =>
			setCharacter((prev) => ({ ...prev, ...c })),
		);
		setCharacter(manager.character.get());
		const unsub = manager.character.subscribe((v) => {
			setCharacter(v);
		});
		onCleanup(() => {
			unsub();
		});
	});
	return { character, setCharacter };
};
