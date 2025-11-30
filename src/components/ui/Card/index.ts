import { createModule } from "@utils/module";
import { createCardState } from "./state";
import type { StateType } from "./state";
import { CardLogic } from "./logic";
import type { LogicType } from "./logic";
import { CardView } from "./view";
import { CardHelper } from "./helper";
import type { HelperType } from "./helper";
import { CardType } from "@type/hollow";
import { Kit } from "solid-kitx";

export type CardProps = {
	node: CardType;
	kit: Kit;
};

export const Card = createModule<StateType, LogicType, CardProps, HelperType>({
	create: (props: CardProps) => {
		const helper = CardHelper(props);
		const state = createCardState(props, helper);
		const logic = CardLogic(state, props, helper);
		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: CardProps,
				helper: HelperType,
			) => CardView(state, logic, props, helper),
		};
	},
});
