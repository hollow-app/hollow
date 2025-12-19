import { PluginsProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { hollow } from "hollow";

export type LogicType = {
	switchUnverified: (e: Event) => void;
	action: () => void;
};

export const PluginsLogic = (
	state: StateType,
	props: PluginsProps,
	helper?: HelperType,
): LogicType => {
	const action = async () => {
		state.setSelectedPlugin((prev) => ({ ...prev, installed: null }));
		const action_state = state.selectedPlugin().action_state;
		if (action_state === "uninstall") {
			const request = await hollow.toolManager.uninstallTool(
				state.selectedPlugin().name,
			);
			request &&
				state.setSelectedPlugin((prev) => ({
					...prev,
					installed: false,
				}));
		} else {
			const isUpdate = action_state === "update";
			const request = await hollow.toolManager.installTool(
				state.selectedPlugin().name,
				state.selectedPlugin().repo,
				isUpdate,
			);
			request &&
				state.setSelectedPlugin((prev) => ({
					...prev,
					installed: true,
					action_state: "uninstall",
				}));
		}
	};

	const switchUnverified = (e: Event) => {
		if (!state.unverified()) {
			e.preventDefault();
			hollow.events.emit("confirm", {
				title: "warning",
				message:
					"Installing unverified plugins may pose security risks.\nOnly install plugins that you trust and are sure are safe.",
				onAccept: () => {
					state.checkUnverified(true);
				},
			});
		} else {
			state.checkUnverified(false);
		}
	};
	return { switchUnverified, action };
};
