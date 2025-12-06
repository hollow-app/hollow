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
	// const getIconFromType = (type: string): { icon: (props:LucideProps)=>Element; color: string } => {
	// 	switch (type) {
	// 		case "achievement":
	// 			return { icon: TrophyIcon, color: "#FFD700" };
	// 		case "reminder":
	// 			return { icon: "Bell", color: "#5A67D8" };
	// 		case "error":
	// 			return { icon: "OctagonX", color: "#E53E3E" };
	// 		case "warning":
	// 			return {
	// 				icon: "OctagonAlert",
	// 				color: "#D69E2E",
	// 			};
	// 		case "update":
	// 			return { icon: "Rocket", color: "#38A169" };
	// 		default:
	// 			return { icon: "Megaphone", color: "#718096" };
	// 	}
	// };
	return { removeNoty, clearAll };
};
