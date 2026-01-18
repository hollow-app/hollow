import { Component, Accessor, lazy, Suspense, Show } from "solid-js";
import SideBar from "../../components/layout-ui/SideBar";
import Navbar from "../../components/layout-ui/sidebars/Navbar";
import Canvas from "../../components/layout-ui/Canvas";
import Sidepanel from "./Sidepanel";
import { useContainer } from "./hooks";
import { StoreProvider } from "@shared/store";

const Settings = lazy(
	async () => import("../../components/layout-ui/Settings"),
);

export interface ContainerProps {
	// Add your props here
}
const Container: Component<ContainerProps> = (props) => {
	const { state, actions } = useContainer();

	return (
		<StoreProvider>
			<div
				class="flex h-full w-full flex-col px-2"
				style={{ background: "var(--back)" }}
			>
				<div class="relative flex h-full flex-1">
					<SideBar setSettings={state.setSettings} />
					<div class="relative flex max-h-full min-w-0 flex-1 flex-col">
						<Navbar />
						<div class="relative flex min-h-0 w-full flex-1 pb-2">
							<Sidepanel
								type="left"
								width="calc(var(--spacing) * 104)"
								padding="0 calc(var(--spacing) * 2) 0 0"
							/>
							<Canvas />
							<Sidepanel
								type="right"
								width="calc(var(--spacing) * 104)"
								padding="0 0 0 calc(var(--spacing) * 2)"
							/>
						</div>
					</div>
				</div>
				<Show when={state.isSettings()}>
					<Suspense>
						<Settings setSettings={state.setSettings} />
					</Suspense>
				</Show>
			</div>
		</StoreProvider>
	);
};

export default Container;
