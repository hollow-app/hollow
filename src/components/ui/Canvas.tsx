import { hollow } from "hollow";
import { createSignal } from "solid-js";
import { NodeType, SolidKitx } from "solid-kitx";
import Card from "./Card";

type CanvasProps = {
	isGridVisible: () => boolean;
};

export default function Canvas({ isGridVisible }: CanvasProps) {
	const [nodes, setNodes] = createSignal<NodeType[]>(
		Object.values(hollow.group()).map((c) => {
			const {
				tool,
				name,
				emoji,
				isPlaced,
				isFavored,
				CreatedDate,
				...rest
			} = c;
			const node: NodeType = rest;
			node.data = {
				component: {
					type: "default",
					props: c,
				},
			};
			return node;
		}),
	);

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
				nodes={nodes()}
				onNodesChange={() => {}}
				connections={[]}
				onConnectionsChange={() => {}}
				viewport={{ x: 0, y: 0, zoom: 1 }}
				onViewportChange={() => {}}
				components={{
					default: Card,
				}}
				gridSize={1}
			/>
		</div>
	);
}
