import { manager } from "@managers/index";
import { NotificationsProps } from ".";
import type { HelperType } from "./helper";
import { Accessor, createSignal, onCleanup, onMount, Setter } from "solid-js";
import { NotifyType } from "@type/NotifyType";

export type StateType = {
	notifications: Accessor<NotifyType[]>;
	setNotifications: Setter<NotifyType[]>;
};

export const createNotificationsState = (
	props: NotificationsProps,
	helper?: HelperType,
): StateType => {
	const [notifications, setNotifications] = createSignal<NotifyType[]>([]);
	onMount(() => {
		const unsub = manager.notify.subscribe(
			(n) => {
				setNotifications([...n]);
			},
			{ key: "notifications", now: true },
		);
		onCleanup(() => {
			unsub;
		});
	});
	return { notifications, setNotifications };
};
