import { createModule } from "@utils/module";
import { createNotebookState } from "./state";
import type { StateType } from "./state";
import { NotebookLogic } from "./logic.tsx";
import type { LogicType } from "./logic.tsx";
import { NotebookView } from "./view";
import { NotebookHelper } from "./helper";
import type { HelperType } from "./helper";
import { ICard } from "@type/hollow";
import { NotebookType } from "../NotebookType";

export type NotebookProps = {
	card: ICard;
	noteBook: NotebookType;
};

const Notebook = createModule<StateType, LogicType, NotebookProps, HelperType>({
	create: (props: NotebookProps) => {
		const helper = NotebookHelper(props);
		const state = createNotebookState(props, helper);
		const logic = NotebookLogic(state, props, helper);

		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: NotebookProps,
				helper: HelperType,
			) => NotebookView(state, logic, props, helper),
		};
	},
});
export default Notebook;
