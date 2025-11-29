import { createModule } from "@utils/module";
import { createContextMenuState } from "./state";
import type { StateType } from "./state";
import { ContextMenuLogic } from "./logic";
import type { LogicType } from "./logic";
import { ContextMenuView } from "./view";
import { ContextMenuHelper } from "./helper";
import type { HelperType } from "./helper";

export type ContextMenuProps = {};

export const ContextMenu = createModule<
	StateType,
	LogicType,
	ContextMenuProps,
	HelperType
>({
	create: (props: ContextMenuProps) => {
		const helper = ContextMenuHelper(props);
		const state = createContextMenuState(props, helper);
		const logic = ContextMenuLogic(state, props, helper);

		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: ContextMenuProps,
				helper: HelperType,
			) => ContextMenuView(state, logic, props, helper),
		};
	},
});

