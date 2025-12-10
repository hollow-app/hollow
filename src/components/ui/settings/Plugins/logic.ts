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
		const isInstalled = state.selectedPlugin().installed;
		state.setSelectedPlugin((prev) => ({ ...prev, installed: null }));
		if (isInstalled) {
			const request = await hollow.toolManager.uninstallTool(
				state.selectedPlugin().name,
			);
			request &&
				state.setSelectedPlugin((prev) => ({
					...prev,
					installed: false,
				}));
		} else {
			const request = await hollow.toolManager.installTool(
				state.selectedPlugin().name,
				state.selectedPlugin().repo,
			);
			request &&
				state.setSelectedPlugin((prev) => ({
					...prev,
					installed: true,
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

