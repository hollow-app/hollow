import { PanelType } from "@type/hollow";
import { hollow } from "hollow";
import { onMount } from "solid-js";

interface PanelWrapperProps {
	type: PanelType;
	// id: string;
	// onMounted: () => void;
}
export function PanelWrapper(props: PanelWrapperProps) {
	const obj = hollow.promises.get(`layout-${props.type}`);
	onMount(() => {
		if (obj) {
			obj.resolve();
		}
	});
	return <div class="h-full w-full" id={obj.id} />;
}
