import { Accessor, createResource, createSignal, onMount } from "solid-js";
import { PluginsProps, PluginType } from ".";
import type { HelperType } from "./helper";
import { Setter } from "solid-js";

export type StateType = {
	unverified: Accessor<boolean>;
	checkUnverified: Setter<boolean>;
	selectedPlugin: Accessor<PluginType>;
	setSelectedPlugin: Setter<PluginType>;
	selectedMD: Accessor<string>;
	setSelectedMD: Setter<string>;
	plugins: Accessor<PluginType[]>;
};

export const createPluginsState = (
	props: PluginsProps,
	helper?: HelperType,
): StateType => {
	const [unverified, checkUnverified] = createSignal(false);
	const [selectedPlugin, setSelectedPlugin] = createSignal(null);
	const [selectedMD, setSelectedMD] = createSignal(null);
	const [plugins] = createResource<PluginType[]>(async () => {
		const response = await fetch(
			"https://raw.githubusercontent.com/hollow-app/hollow-registry/refs/heads/main/plugins.json",
		);
		return await response.json();
	});
	return {
		unverified,
		checkUnverified,
		selectedPlugin,
		setSelectedPlugin,
		selectedMD,
		setSelectedMD,
		plugins,
	};
};

