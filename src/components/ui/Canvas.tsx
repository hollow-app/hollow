import { hollow } from "hollow";
import {
	Accessor,
	createEffect,
	createMemo,
	on,
	onMount,
	Show,
} from "solid-js";
import {
	BackgroundGrid,
	ConfigsType,
	ConnectionType,
	Kit,
	NodeType,
	SolidKitx,
	ViewPort,
} from "solid-kitx";
import { createStore, unwrap } from "solid-js/store";
import { createSignal } from "solid-js";
import { RealmManager } from "@managers/RealmManager";
import { Card } from "./Card";
import { SettingsManager } from "@managers/SettingsManager";
import { ToolManager } from "@managers/ToolManager";

type CanvasProps = {
	canvasConfigs: Accessor<ConfigsType>;
	setCanvasConfigs: Accessor<ConfigsType>;
	isLiveEditor: Accessor<boolean>;
};

const vpKey = `${RealmManager.getSelf().getCurrent().id}-viewport`;
export default function Canvas(props: CanvasProps) {
	const connectionsStore = createStore<ConnectionType[]>([]);
	const viewportSignal = createSignal(
		JSON.parse(localStorage.getItem(vpKey) ?? '{"x":0, "y":0, "zoom":1}'),
	);
	const onNodesChange = (nodes?: string[]) => {
		if (nodes && props.isLiveEditor()) {
			const cards = hollow.cards();
			nodes.forEach((id) => {
				const target = cards.find((i) => i.id === id);
				if (target) {
					hollow.toolManager.setCard(
						target.data.extra.tool,
						id,
						{},
						target,
					);
				}
			});
		}
	};
	const onViewportChange = (vp: ViewPort) => {
		localStorage.setItem(vpKey, JSON.stringify(vp));
	};

	// createEffect(on(props.isLiveEditor,(v)=>{
	// 	if(!v){
	// 		hollow.toolManager.updateCard(selectedCard().tool, card);
	// 	}
	// }, {defer:true}))

	return (
		<div class="bg-secondary/30 border-secondary-10 relative h-full w-full overflow-hidden rounded-xl border">
			<div
				class="absolute top-0 left-0 h-full w-full object-cover"
				style={{
					background: "var(--canvas-bg-image)",
					opacity: "var(--canvas-bg-opacity)",
					"background-size": "cover",
					"background-position": "center",
					"background-repeat": "no-repeat",
				}}
			/>
			<SolidKitx
				nodesStore={[hollow.cards(), hollow.setCards]}
				connectionsStore={connectionsStore}
				onNodesChange={onNodesChange}
				onConnectionsChange={() => {}}
				viewportSignal={viewportSignal}
				onViewportChange={onViewportChange}
				components={{
					default: Card,
				}}
				gridSize={SettingsManager.getSelf().gridSize[0]()}
				{...props.canvasConfigs()}
			>
				{(kit: Kit) => (
					<>
						<Show
							when={
								props.isLiveEditor() &&
								SettingsManager.getSelf().gridSize[0]() >= 30
							}
						>
							<BackgroundGrid
								kit={kit}
								type={SettingsManager.getSelf().getConfig(
									"grid-type",
								)}
							/>
						</Show>
					</>
				)}
			</SolidKitx>
		</div>
	);
}
