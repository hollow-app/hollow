import { ContainerProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import SideBar from "@components/ui/SideBar";
import { lazy, Suspense } from "solid-js";
import Sidepanel from "./Sidepanel";
import Navbar from "@components/ui/sidebars/Navbar";
import Canvas from "@components/ui/Canvas";
import { Show } from "solid-js";
const Settings = lazy(async () => import("@components/ui/Settings"));

export const ContainerView = (
	state: StateType,
	logic: LogicType,
	props: ContainerProps,
	helper?: HelperType,
) => {
	return (
		<div class="bg-secondary flex h-full w-full flex-col px-2">
			<div class="relative flex h-full flex-1">
				<SideBar
					layout={state.controller}
					setDrag={state.setDrag}
					isDrag={state.isDrag}
					setSettings={state.setSettings}
				/>
				<Sidepanel
					type="left"
					width="calc(var(--spacing) * 104)"
					controller={state.controller}
				/>
				<div class="relative flex max-h-full min-w-0 flex-1 flex-col">
					<Navbar />
					<div class="flex min-h-0 w-full flex-1 pb-2">
						<Canvas />
						<Sidepanel
							type="right"
							controller={state.controller}
							width="calc(var(--spacing) * 104)"
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
	);
};
