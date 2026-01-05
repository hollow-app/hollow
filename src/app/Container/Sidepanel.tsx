import setStyle from "@hooks/setStyle";
import { Layout, PanelType } from "@utils/layout";
import { PanelWrapper } from "@utils/kinda-junk/PanelWrapper";
import { Accessor, createEffect, createMemo, For, on, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

type SidepanelProps = {
	type: PanelType;
	controller: Layout;
	width: string;
	padding: string;
	disableAnimation: Accessor<boolean>;
};

export default function Sidepanel(props: SidepanelProps) {
	const layout = createMemo(() => props.controller.get[props.type]);

	createEffect(
		on(
			() => layout().visible,
			(v) => {
				const value = v ? props.width : "0px";
				setStyle([{ name: `--layout-${props.type}`, value }]);
			},
			{ defer: true },
		),
	);

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
								duration: props.disableAnimation() ? 0 : 0.5,
							}}
							class="border-secondary-10 flex h-full shrink-0 flex-col overflow-hidden"
							style={{
								["border-" +
								(props.type === "left" ? "right" : "left") +
								"-width"]: "1px",
							}}
						>
							<div
								style={{
									width: props.width,
									height: "100%",
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
						</Motion.div>
					</Show>
				)}
			</For>
		</Presence>
	);
}
