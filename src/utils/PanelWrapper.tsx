import { PanelType } from "@type/hollow";
import { hollow } from "hollow";
import { onMount } from "solid-js";
import styles from "./index.module.css";

interface PanelWrapperProps {
	type: PanelType;
}
export function PanelWrapper(props: PanelWrapperProps) {
	const obj = hollow.promises.get(`layout-${props.type}`);
	onMount(() => {
		if (obj) {
			obj.resolve();
		}
	});
	return <div class={`h-full w-full ${styles.parent}`} id={obj.id}></div>;
}
