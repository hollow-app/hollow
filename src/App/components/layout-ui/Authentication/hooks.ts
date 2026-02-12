import { Accessor, createSignal, Setter } from "solid-js";

export interface AuthenticationProps {}

export type authType =
	| "sign-in"
	| "sign-up"
	| "recover-account"
	| "reset-password";
interface State {
	type: Accessor<authType>;
	setType: Setter<authType>;
}

interface Actions {}

interface AuthenticationHook {
	state: State;
	actions: Actions;
}

export const useAuthentication = (
	props: AuthenticationProps,
): AuthenticationHook => {
	const [type, setType] = createSignal<authType>("reset-password");

	return { state: { type, setType }, actions: {} };
};
