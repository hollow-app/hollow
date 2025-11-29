import { createModule } from "@utils/module";
import { createVaultState } from "./state";
import type { StateType } from "./state";
import { VaultLogic } from "./logic";
import type { LogicType } from "./logic";
import { VaultView } from "./view";
import { VaultHelper } from "./helper";
import type { HelperType } from "./helper";

export type VaultProps = {
	onSelect?: (p: string) => void;
};

export const Vault = createModule<StateType, LogicType, VaultProps, HelperType>(
	{
		create: (props: VaultProps) => {
			const helper = VaultHelper(props);
			const state = createVaultState(props, helper);
			const logic = VaultLogic(state, props, helper);

			return {
				helper,
				state,
				logic,
				view: (
					state: StateType,
					logic: LogicType,
					props: VaultProps,
					helper: HelperType,
				) => VaultView(state, logic, props, helper),
			};
		},
	},
);

