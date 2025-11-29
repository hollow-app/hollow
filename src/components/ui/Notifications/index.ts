import { createModule } from "@utils/module";
import { createNotificationsState } from "./state";
import type { StateType } from "./state";
import { NotificationsLogic } from "./logic";
import type { LogicType } from "./logic";
import { NotificationsView } from "./view";
import { NotificationsHelper } from "./helper";
import type { HelperType } from "./helper";
import { Accessor, Setter } from "solid-js";

export type NotificationsProps = {
	hide: () => void;
};

const Notifications = createModule<
	StateType,
	LogicType,
	NotificationsProps,
	HelperType
>({
	create: (props: NotificationsProps) => {
		const helper = NotificationsHelper(props);
		const state = createNotificationsState(props, helper);
		const logic = NotificationsLogic(state, props, helper);

		return {
			helper,
			state,
			logic,
			view: (
				state: StateType,
				logic: LogicType,
				props: NotificationsProps,
				helper: HelperType,
			) => NotificationsView(state, logic, props, helper),
		};
	},
});

export default Notifications;
