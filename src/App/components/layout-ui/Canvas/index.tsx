import { Component, createMemo, For, onCleanup, onMount, Show } from "solid-js";
import "gridstack/dist/gridstack.css";
import { Card } from "../Card";
import { useCanvas, CanvasProps } from "./hooks";
import Scrollbar from "smooth-scrollbar";
import { useStore } from "@store";
import { Button, Empty } from "@ui";
import { form_newInstance } from "@app/utils/common";
import { getHand } from "@app/managers/Module/effects";
import { LayersPlusIcon } from "lucide-solid";

export const Canvas: Component<CanvasProps> = (props) => {
	const { state } = useCanvas(props);
	const store = useStore();
	const placedInstances = createMemo(() =>
		store.state.module.instances.filter((i) => i.data.isPlaced),
	);
	let scrollEl!: HTMLDivElement;
	onMount(() => {
		const scrollbar = Scrollbar.init(scrollEl, {});
		onCleanup(() => {
			scrollbar.destroy();
		});
	});
	return (
		<div
			ref={state.setCanvasEl}
			class="canvas-parent relative h-full flex-1 shrink-0 overflow-hidden"
		>
			<div ref={scrollEl} class={"h-full w-full"}>
				<div
					class="relative"
					style={{
						width: "calc(100vw - calc(var(--spacing) * 19) - 2px - var(--negative-grid-gap))",
						"min-height":
							"calc(100vh - calc(var(--spacing) * 4) - 2px - var(--negative-grid-gap))",
						"margin-left": "var(--negative-grid-gap)",
						"margin-top": "var(--negative-grid-gap)",
					}}
				>
					<Show
						when={placedInstances().length > 0}
						fallback={
							<div class="absolute flex h-full w-full items-center justify-center">
								<Empty.Root>
									<Empty.Icon icon={LayersPlusIcon} />
									<Empty.Title>No Instances Yet.</Empty.Title>
									<Empty.Description>
										You haven't placed any Instances of
										tools yet.
										<br /> Get started by creating an
										Instance.
									</Empty.Description>
									<div class="flex gap-2">
										<Button
											variant="primary"
											onclick={() =>
												form_newInstance(
													store.dispatch,
													() => getHand(),
												)
											}
											size="sm"
										>
											Create
										</Button>
										<Button
											variant="secondary"
											onclick={() =>
												store.dispatch({
													domain: "layout",
													type: "select-panel",
													id: "expand",
													variant: "left",
												})
											}
											size="sm"
											disabled={
												store.state.module.instances
													.length === 0
											}
										>
											Browse
										</Button>
									</div>
								</Empty.Root>
							</div>
						}
					>
						<div
							class="grid-stack min-h-full min-w-full"
							ref={state.setGridEl}
						>
							<For each={placedInstances()}>
								{(item) => (
									<Card
										node={item}
										grid={state.grid()!}
										canvasEl={state.canvasEl}
									/>
								)}
							</For>
						</div>
					</Show>
				</div>
			</div>
		</div>
	);
};

export default Canvas;
