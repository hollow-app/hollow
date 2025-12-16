import { onCleanup, onMount } from "solid-js";
import styles from "./index.module.css";
import { Layout } from "./layout";

interface PanelWrapperProps {
	id: string;
	layout: Layout;
}

export function PanelWrapper(props: PanelWrapperProps) {
	return () => {
		let el: HTMLDivElement;
		onMount(() => {
			const obj = props.layout.panels.extra
				.find((i) => i.id === props.id)
				.mount(el);
			onCleanup(() => {
				obj.unmount();
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
