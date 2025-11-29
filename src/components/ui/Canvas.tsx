import { hollow } from "hollow";
import { Accessor, createMemo } from "solid-js";
import {
	ConfigsType,
	ConnectionType,
	NodeType,
	SolidKitx,
	ViewPort,
} from "solid-kitx";
import { createStore, unwrap } from "solid-js/store";
import { createSignal } from "solid-js";
import { RealmManager } from "@managers/RealmManager";
import { Card } from "./Card";

type CanvasProps = {
	canvasConfigs: Accessor<ConfigsType>;
	setCanvasConfigs: Accessor<ConfigsType>;
};

const vpKey = `${RealmManager.getSelf().getCurrent().id}-viewport`;
export default function Canvas(props: CanvasProps) {
	const connectionsStore = createStore<ConnectionType[]>([]);
	const viewportSignal = createSignal(
		JSON.parse(localStorage.getItem(vpKey) ?? '{"x":0, "y":0, "zoom":1}'),
	);
	// u
	const onNodesChange = (nodes: NodeType[]) => {};
	const onViewportChange = (vp: ViewPort) => {
		localStorage.setItem(vpKey, JSON.stringify(vp));
	};

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
				{...props.canvasConfigs()}
			/>
		</div>
	);
}
