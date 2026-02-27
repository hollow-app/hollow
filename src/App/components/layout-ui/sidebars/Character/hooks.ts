import { Accessor, createMemo } from "solid-js";
import { hollow } from "../../../../../hollow";
import { Character } from "@app/type/Character";
import { useStore } from "@store";
import { toggleVault } from "@app/context/actions";
import { AccountState } from "@app/managers/Account";

export interface CharacterProps {}

export interface CharacterState {
	account: Accessor<AccountState | null>;
}

export interface CharacterActions {}

export interface CharacterHook {
	state: CharacterState;
	actions: CharacterActions;
}

export const useCharacter = (): CharacterHook => {
	const { state, dispatch } = useStore();
	const account = createMemo(() => state.account);

	return {
		state: {
			account,
		},
		actions: {},
	};
};
