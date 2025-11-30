import { LayoutController, PanelType, SideLayout } from "@type/Layout";
import { hollow } from "hollow";
import { createMemo, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

type SidepanelProps = {
	type: PanelType;
	controller: LayoutController;
	width: string;
};

export default function Sidepanel({ type, controller, width }: SidepanelProps) {
	const layout = createMemo(() => controller.get[type]);
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
								}}
							/>
						</Motion.div>
					</Show>
				)}
			</For>
		</Presence>
	);
}
