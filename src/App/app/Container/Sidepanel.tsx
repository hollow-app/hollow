import { getLayoutCore, LayoutVariant } from "@app/managers/layout";
import { createMemo, For, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { useStore } from "@store";

type SidepanelProps = {
	type: LayoutVariant;
	width: string;
	padding: string;
};
// const side = ["left", "right"];
export default function Sidepanel(props: SidepanelProps) {
	const { state } = useStore();
	const layout = createMemo(() => state.layout[props.type]);

	return (
		<Presence exitBeforeEnter>
			<For each={layout().panels}>
				{(panel) => (
					<Show when={layout().visible && layout().current === panel}>
						<Motion.div
							initial={{
								opacity: 0,
								padding: 0,
							}}
							animate={{
								opacity: 1,
								padding: props.padding,
							}}
							exit={{
								opacity: 0,
								padding: 0,
							}}
							transition={{
								duration: 0.3,
							}}
							style={{
								width: props.width,
								// [props.type]: "0",
							}}
							class="border-secondary-10 flex h-full shrink-0 overflow-hidden"
							classList={{
								"flex-row-reverse": props.type === "right",
							}}
						>
							<div
								class="h-full"
								style={{
									"min-width": `calc(${props.width} - ${state.context.isFocus ? "0px" : "1px"})`,
								}}
							>
								{(() => {
									const Comp =
										getLayoutCore()[props.type][panel]
											.Component;

									return (
										<Show
											when={Comp}
											fallback={
												<div>Something went wrong</div>
											}
										>
											<Comp />
										</Show>
									);
								})()}
							</div>
							<Show when={!state.context.isFocus}>
								<hr
									class="h-full w-px shrink-0 border-0"
									style={{
										background:
											"linear-gradient(to bottom, transparent , var(--high) 20%, var(--high) 80%, transparent)",
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
