import { Accessor, createMemo } from "solid-js";
import { NotifyType } from "@type/NotifyType";
import { useStore } from "store";

export interface NotificationsProps {
	hide: () => void;
}

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
		props.hide();
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
