import { Accessor, createMemo } from "solid-js";
import { NotifyType } from "@app/type/NotifyType";
import { useStore } from "@app/store";

export interface NotificationsProps {}

export interface NotificationsState {
	notifications: Accessor<NotifyType[]>;
}

export interface NotificationsActions {
	removeNoty: (id: string) => void;
	clearAll: () => void;
}

export interface NotificationsHook {
	state: NotificationsState;
	actions: NotificationsActions;
}

export const useNotifications = (
	props: NotificationsProps,
): NotificationsHook => {
	const { state, dispatch } = useStore();
	const notifications = createMemo(() => state.notifications.notifications);

	const removeNoty = (id: string) => {
		dispatch({
			domain: "notifications",
			type: "remove-notification",
			id,
		});
	};

	const clearAll = () => {
		dispatch({
			domain: "notifications",
			type: "clear-all",
		});
	};

	return {
		state: {
			notifications,
		},
		actions: {
			removeNoty,
			clearAll,
		},
	};
};
