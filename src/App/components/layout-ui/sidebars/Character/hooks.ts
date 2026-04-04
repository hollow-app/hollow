import { Accessor, createMemo } from "solid-js";
import { useStore } from "@app/store";
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
