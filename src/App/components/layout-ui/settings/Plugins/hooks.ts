import {
	createSignal,
	createResource,
	Accessor,
	Setter,
	Resource,
} from "solid-js";
import { hollow } from "hollow";

export interface PluginType {
	name: string;
	desc: string;
	version: string;
	repo: string;
	author: string;
	verified: boolean;
	verificationDate: string;
	installed?: boolean;
	action_state?: "install" | "update" | "uninstall";
	icon?: string;
}

export interface PluginsProps {}

export interface PluginsState {
	unverified: Accessor<boolean>;
	checkUnverified: Setter<boolean>;
	selectedPlugin: Accessor<PluginType | null>;
	setSelectedPlugin: Setter<PluginType | null>;
	selectedMD: Accessor<string | null>;
	setSelectedMD: Setter<string | null>;
	plugins: Resource<PluginType[]>;
}

export interface PluginsActions {
	switchUnverified: (e: Event) => void;
	action: (e: Event & { currentTarget: HTMLButtonElement }) => Promise<void>;
}

export interface PluginsHook {
	state: PluginsState;
	actions: PluginsActions;
}

import { HandType } from "@type/HandType";
import { useStore } from "store";
import { getHand } from "@managers/Module/effects";
import { add_plugin, reload } from "../../../../../Hollow/rust";

// ... (imports)

export const usePlugins = (): PluginsHook => {
	const { state, dispatch } = useStore();
	const [unverified, checkUnverified] = createSignal(false);
	const [selectedPlugin, setSelectedPlugin] = createSignal<PluginType | null>(
		null,
	);
	const [selectedMD, setSelectedMD] = createSignal<string | null>(null);

	const [plugins] = createResource<PluginType[]>(async () => {
		const response = await fetch(
			"https://raw.githubusercontent.com/hollow-app/hollow-registry/refs/heads/main/plugins.json",
		);
		return await response.json();
	});

	const action = async (e: Event & { currentTarget: HTMLButtonElement }) => {
		const el = e.currentTarget;
		const plugin = selectedPlugin();
		if (!plugin) return;

		const name = plugin.name;
		const icon = plugin.icon;
		const actionState = plugin.action_state;

		const delay = () => new Promise((r) => setTimeout(r, 2000));
		const removeIcon = async () => {
			const item = state.vault.items.find((i) => i.url === icon);
			if (item) {
				dispatch({
					domain: "vault",
					type: "remove-items",
					paths: [item.path],
				});
			}
		};

		setSelectedPlugin((p) => (p ? { ...p, installed: undefined } : null));

		if (actionState === "uninstall") {
			el.classList.add("debounce");

			const closeAlert = hollow.events.emit("alert", {
				message: `Uninstalling ${name}`,
				type: "loading",
			});

			const success = await dispatch({
				domain: "module",
				type: "uninstall-module",
				name: name.toLowerCase(),
			});

			await delay();
			el.classList.remove("debounce");
			await removeIcon();
			closeAlert();

			if (success) {
				setSelectedPlugin((p) =>
					p
						? {
								...p,
								installed: false,
								action_state: "install",
							}
						: null,
				);
			}

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

		// Install Logic
		let success = false;
		const request = await add_plugin({
			name,
			repo: plugin.repo,
		});
		if (request.state) {
			const manifest = JSON.parse(request.manifest);
			const newTool: HandType = {
				...manifest,
				icon: request.icon,
				name: manifest.name.toLowerCase(),
				cards: [],
				signed: true,
			};

			if (isUpdate) {
				const currentTool = getHand()[name.toLowerCase()];
				if (currentTool) {
					newTool.cards = currentTool.cards;
				}
			}

			success = await dispatch({
				domain: "module",
				type: "install-module",
				name: name.toLowerCase(),
				repo: plugin.repo,
				isUpdate,
			});

			if (isUpdate) {
				await delay();
				reload();
			}
		}

		await delay();
		el.classList.remove("debounce");
		closeAlert();

		if (success) {
			setSelectedPlugin((p) =>
				p
					? {
							...p,
							installed: true,
							action_state: "uninstall",
						}
					: null,
			);
		}
	};

	const switchUnverified = (e: Event) => {
		if (!unverified()) {
			e.preventDefault();
			hollow.events.emit("confirm", {
				title: "warning",
				message:
					"Installing unverified plugins may pose security risks.\nOnly install plugins that you trust and are sure are safe.",
				onAccept: () => {
					checkUnverified(true);
				},
			});
		} else {
			checkUnverified(false);
		}
	};

	return {
		state: {
			unverified,
			checkUnverified,
			selectedPlugin,
			setSelectedPlugin,
			selectedMD,
			setSelectedMD,
			plugins,
		},
		actions: {
			switchUnverified,
			action,
		},
	};
};
