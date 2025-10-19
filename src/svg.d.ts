declare module "*.svg" {
	import type { ComponentProps } from "solid-js";
	export const Component: (props: ComponentProps<"svg">) => any;
	export default Component;
}
