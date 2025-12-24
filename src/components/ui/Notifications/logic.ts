import { NotificationsProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { manager } from "@managers/index";
import { IconNode, LucideIcon, LucideProps, TrophyIcon } from "lucide-solid";

export type LogicType = {
	removeNoty: (id: string) => void;
	clearAll: () => void;
};

export const NotificationsLogic = (
	state: StateType,
	props: NotificationsProps,
	helper?: HelperType,
): LogicType => {
	// TODO if list is seen then no alert
	const removeNoty = (id: string) => {
		state.setNotifications((prev) => [...prev.filter((i) => i.id !== id)]);
		manager.notify.removeNoty(id);
	};
	const clearAll = () => {
		props.hide();
		state.setNotifications([]);
		manager.notify.clearAll();
	};
	return { removeNoty, clearAll };
};
