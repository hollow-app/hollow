import { manager } from "@managers/index";
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
	const [notifications, setNotifications] = createSignal<NotifyType[]>(
		// manager.notify.getNotification(),
		[
			{
				id: "example",
				message: "Example content",
				submitted_at: new Date().toISOString(),
				title: "Title Of Some sort",
			},
		],
	);
	return { notifications, setNotifications };
};
