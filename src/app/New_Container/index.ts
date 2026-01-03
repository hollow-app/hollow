import { createModule } from "../../utils/module";
import { createContainerState } from "./state";
import type { StateType } from "./state";
import { ContainerLogic } from "./logic";
import type { LogicType } from "./logic";
import { ContainerView } from "./view";
import { ContainerHelper } from "./helper";
import type { HelperType } from "./helper";

export type ContainerProps = {};

const Container = createModule<
	StateType,
	LogicType,
	ContainerProps,
	HelperType
>({
	create: (props: ContainerProps) => {
		const helper = ContainerHelper(props);
		const state = createContainerState(props, helper);
		const logic = ContainerLogic(state, props, helper);
		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: ContainerProps,
				helper: HelperType,
			) => ContainerView(state, logic, props, helper),
		};
	},
});
export default Container;
