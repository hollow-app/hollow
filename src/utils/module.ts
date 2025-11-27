import { JSX } from "solid-js/jsx-runtime";

export type ModuleOptions<S, L, P = {}, H = {}> = {
	create: (props: P) => {
		helper: H;
		state: S;
		logic: L;
		view: (state: S, logic: L, props: P, helper: H) => JSX.Element;
	};
};

export const createModule = <S, L, P = {}, H = {}>(
	options: ModuleOptions<S, L, P, H>,
) => {
	return (props: P) => {
		const { helper, state, logic, view } = options.create(props);
		return view(state, logic, props, helper);
	};
};

