import setStyle from "@hooks/setStyle";
import { Layout, PanelType } from "@utils/layout";
import { PanelWrapper } from "@utils/kinda-junk/PanelWrapper";
import { createMemo, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";
import { useHollow } from "../../HollowContext";

type SidepanelProps = {
	type: PanelType;
	controller: Layout;
	width: string;
	padding: string;
};

// const side = ["left", "right"];
export default function Sidepanel(props: SidepanelProps) {
	const layout = createMemo(() => props.controller.get[props.type]);
	// const opp = side[side.indexOf(props.type) ^ 1];
	const { isFocus } = useHollow();

	return (
		<Presence exitBeforeEnter>
			<For each={layout().panels}>
				{(panel) => (
					<Show when={layout().visible && layout().current === panel}>
						<Motion.div
							initial={{
								opacity: 0,
								width: "0px",
								padding: 0,
							}}
							animate={{
								opacity: 1,
								width: props.width,
								padding: props.padding,
							}}
							exit={{
								opacity: 0,
								width: "0px",
								padding: 0,
							}}
							transition={{
								duration: 0.5,
							}}
							class="border-secondary-10 flex h-full shrink-0 overflow-hidden"
							classList={{
								"flex-row-reverse": props.type === "right",
							}}
						>
							<div
								class="h-full"
								style={{
									"min-width": `calc(${props.width} - ${isFocus() ? "0px" : "1px"})`,
								}}
							>
								<Dynamic
									component={
										props.controller.panels[props.type][
											panel
										] ??
										PanelWrapper({
											id: panel,
											layout: props.controller,
										})
									}
									{...{
										hide: () =>
											props.controller.selectPanel(
												props.type,
												panel,
											),
										type: props.type,
									}}
								/>
							</div>
							<Show when={!isFocus()}>
								<hr
									class="h-full w-px shrink-0 border-0"
									style={{
										background:
											"linear-gradient(to bottom, transparent , var(--color-secondary-10) 20%, var(--color-secondary-10) 80%, transparent)",
									}}
								/>
							</Show>
						</Motion.div>
					</Show>
				)}
			</For>
		</Presence>
	);
}
