import { Layout } from "@type/hollow";
import { ContainerProps } from ".";
import type { HelperType } from "./helper";
import { createLayout } from "@utils/layout";
import { hollow } from "hollow";
import { Accessor, onMount, Setter } from "solid-js";
import { createSignal } from "solid-js";

export type StateType = {
	controller: Layout;
	isSettings: Accessor<boolean>;
	isDrag: Accessor<boolean>;
	setSettings: Setter<boolean>;
	setDrag: Setter<boolean>;
};

export const createContainerState = (
	props: ContainerProps,
	helper?: HelperType,
): StateType => {
	const controller = createLayout();
	const [isSettings, setSettings] = createSignal(false);
	const [isDrag, setDrag] = createSignal(false);

	onMount(() => {
		hollow.pevents.on("editor", () => {
			controller.selectPanel("right", "editor");
		});
	});
	return {
		controller,
		isSettings,
		setSettings,
		isDrag,
		setDrag,
	};
};
