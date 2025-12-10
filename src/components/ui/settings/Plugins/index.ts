import { createModule } from "@utils/module";
import { createPluginsState } from "./state";
import type { StateType } from "./state";
import { PluginsLogic } from "./logic";
import type { LogicType } from "./logic";
import { PluginsView } from "./view";
import { PluginsHelper } from "./helper";
import type { HelperType } from "./helper";

export interface PluginType {
	name: string;
	desc: string;
	version: string;
	repo: string;
	author: string;
	verified: boolean;
	verificationDate: string;
	installed?: boolean;
}
export type PluginsProps = {};

const Plugins = createModule<StateType, LogicType, PluginsProps, HelperType>({
	create: (props: PluginsProps) => {
		const helper = PluginsHelper(props);
		const state = createPluginsState(props, helper);
		const logic = PluginsLogic(state, props, helper);

		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: PluginsProps,
				helper: HelperType,
			) => PluginsView(state, logic, props, helper),
		};
	},
});

export default Plugins;

