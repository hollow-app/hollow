import { onCleanup, onMount } from "solid-js";
import styles from "./index.module.css";
import { LayoutCapability } from "@app/type/hollow";

interface Props {
	main: LayoutCapability;
}

export function LayoutWrapper(props: Props) {
	return () => {
		let el: HTMLDivElement;
		onMount(() => {
			props.main.mount(el);
		});
		onCleanup(() => {
			props.main.unMount();
		});
		return (
			<div
				ref={el}
				class={`box-border h-full w-full pr-2 ${styles.parent}`}
			></div>
		);
	};
}
