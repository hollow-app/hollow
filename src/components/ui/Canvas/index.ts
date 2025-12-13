import { createModule } from "@utils/module";
import { createCanvasState } from "./state";
import type { StateType } from "./state";
import { CanvasLogic } from "./logic";
import type { LogicType } from "./logic";
import { CanvasView } from "./view";
import { CanvasHelper } from "./helper";
import type { HelperType } from "./helper";
import { Accessor } from "solid-js";
import { GridStackOptions } from "gridstack";
import { Layout } from "@type/hollow";

export type CanvasProps = {
	canvasConfigs: Accessor<GridStackOptions>;
	setCanvasConfigs: Accessor<GridStackOptions>;
	isLiveEditor: Accessor<boolean>;
	layout: Layout;
};

const Canvas = createModule<StateType, LogicType, CanvasProps, HelperType>({
	create: (props: CanvasProps) => {
		const helper = CanvasHelper(props);
		const state = createCanvasState(props, helper);
		const logic = CanvasLogic(state, props, helper);

		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: CanvasProps,
				helper: HelperType,
			) => CanvasView(state, logic, props, helper),
		};
	},
});
export default Canvas;
