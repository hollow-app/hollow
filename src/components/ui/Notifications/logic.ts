import { NotificationsProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { NotifyManager } from "@managers/NotifyManager";
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
		NotifyManager.getSelf().removeNoty(id);
	};
	const clearAll = () => {
		props.hide();
		state.setNotifications([]);
		NotifyManager.getSelf().clearAll();
	};
	return { removeNoty, clearAll };
};
