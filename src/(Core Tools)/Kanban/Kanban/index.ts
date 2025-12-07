import { createModule } from "@utils/module";
import { createKanbanState } from "./state";
import type { StateType } from "./state";
import { KanbanLogic } from "./logic";
import type { LogicType } from "./logic";
import { KanbanView } from "./view";
import { KanbanHelper } from "./helper";
import type { HelperType } from "./helper";
import { ColumnType } from "../types/ColumnType";
import { CardType } from "@type/hollow";

export type KanbanProps = {
	data: ColumnType;
	card: CardType;
};

const Kanban = createModule<StateType, LogicType, KanbanProps, HelperType>({
	create: (props: KanbanProps) => {
		const helper = KanbanHelper(props);
		const state = createKanbanState(props, helper);
		const logic = KanbanLogic(state, props, helper);

		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: KanbanProps,
				helper: HelperType,
			) => KanbanView(state, logic, props, helper),
		};
	},
});

export default Kanban;
