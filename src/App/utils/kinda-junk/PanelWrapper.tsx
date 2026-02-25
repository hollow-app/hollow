import { onCleanup, onMount } from "solid-js";
import styles from "./index.module.css";
import { getLayoutPanels } from "@app/managers/layout";

interface PanelWrapperProps {
	id: string;
}

export function PanelWrapper(props: PanelWrapperProps) {
	return () => {
		let el: HTMLDivElement;
		onMount(() => {
			const obj = getLayoutPanels().extra.find(
				(i) => i.meta.name === props.id,
			).capability;
			obj.mount(el);
			onCleanup(() => {
				obj.unMount();
			});
		});
		return (
			<div
				ref={el}
				class={`box-border h-full w-full pr-2 ${styles.parent}`}
			></div>
		);
	};
}
