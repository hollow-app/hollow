import { NotifyManager } from "@managers/NotifyManager";
import { NotificationsProps } from ".";
import type { HelperType } from "./helper";
import { Accessor, createSignal, Setter } from "solid-js";
import { NotifyType } from "@type/hollow";

export type StateType = {
	notifications: Accessor<NotifyType[]>;
	setNotifications: Setter<NotifyType[]>;
};

export const createNotificationsState = (
	props: NotificationsProps,
	helper?: HelperType,
): StateType => {
	const [notifications, setNotifications] = createSignal(
		NotifyManager.getSelf().getNotification(),
	);
	return { notifications, setNotifications };
};

