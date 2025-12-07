import setStyle from "@hooks/setStyle";
import { Layout, PanelType } from "@type/hollow";
import { hollow } from "hollow";
import { createEffect, createMemo, For, on, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

type SidepanelProps = {
	type: PanelType;
	controller: Layout;
	width: string;
};

export default function Sidepanel({ type, controller, width }: SidepanelProps) {
	const layout = createMemo(() => controller.get[type]);

	createEffect(
		on(
			() => layout().visible,
			(v) => {
				const value = v ? width : "0px";
				setStyle([{ name: `--layout-${type}`, value }]);
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
							}}
							animate={{
								opacity: 1,
								width,
							}}
							exit={{
								opacity: 0,
								width: "0px",
							}}
							transition={{ duration: 0.5 }}
							class="bg-secondary flex h-full shrink-0 flex-col overflow-hidden overflow-y-scroll"
						>
							<Dynamic
								component={controller.panels[type][panel]}
								{...{
									hide: () =>
										controller.selectPanel(type, panel),
									type: type,
								}}
							/>
						</Motion.div>
					</Show>
				)}
			</For>
		</Presence>
	);
}
