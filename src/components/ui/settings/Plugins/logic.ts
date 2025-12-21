import { PluginsProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { hollow } from "hollow";
import { resolve } from "path";
import VaultManager from "@managers/VaultManager";

export type LogicType = {
	switchUnverified: (e: Event) => void;
	action: (e: Event & { currentTarget: HTMLButtonElement }) => void;
};

export const PluginsLogic = (
	state: StateType,
	props: PluginsProps,
	helper?: HelperType,
): LogicType => {
	const action = async (e: Event & { currentTarget: HTMLButtonElement }) => {
		const el = e.currentTarget;
		const plugin = state.selectedPlugin();
		const name = plugin.name;
		const icon = plugin.icon;
		const actionState = plugin.action_state;
		const vm = VaultManager.getSelf();

		const delay = () => new Promise((r) => setTimeout(r, 2000));
		const removeIcon = async () => {
			const item = vm.getVault().find((i) => i.url === icon);
			item && (await vm.removeItems([item.path]));
		};

		state.setSelectedPlugin((p) => ({ ...p, installed: null }));

		if (actionState === "uninstall") {
			el.classList.add("debounce");

			const closeAlert = hollow.events.emit("alert", {
				message: `Uninstalling ${name}`,
				type: "loading",
			});

			const success = await hollow.toolManager.uninstallTool(
				name.toLowerCase(),
			);

			await delay();
			el.classList.remove("debounce");
			await removeIcon();
			closeAlert();

			success &&
				state.setSelectedPlugin((p) => ({
					...p,
					installed: false,
					action_state: "install",
				}));

			return;
		}

		const isUpdate = actionState === "update";

		if (isUpdate) {
			const confirmed = await new Promise<boolean>((resolve) => {
				hollow.events.emit("confirm", {
					title: "Warning",
					message:
						"Updating a plugin will require you to reload the app\nContinue ?",
					onAccept: () => resolve(true),
					onRefuse: () => resolve(false),
				});
			});

			if (!confirmed) return;

			await removeIcon();
		}

		el.classList.add("debounce");

		const closeAlert = hollow.events.emit("alert", {
			message: `${isUpdate ? "Updating" : "Installing"} ${name}`,
			type: "loading",
		});

		const success = await hollow.toolManager.installTool(
			name.toLowerCase(),
			plugin.repo,
			isUpdate,
		);

		await delay();
		el.classList.remove("debounce");
		closeAlert();

		success &&
			state.setSelectedPlugin((p) => ({
				...p,
				installed: true,
				action_state: "uninstall",
			}));
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
