import { Events, NotificationsState } from "./type";
import { NotifyType } from "@type/NotifyType";
import { isExpired, weekOld } from "../../utils/manipulation/strings";
import { _dispatch } from "@shared/store/effects";

export function setupNotifications(d: (action: any) => void) {
	const savedData = localStorage.getItem("notifications");
	const data = savedData
		? JSON.parse(savedData)
		: { notifications: [], alert: false };

	_dispatch({
		domain: "notifications",
		type: "set-notifications",
		notifications: data.notifications,
		alert: data.alert,
	});

	checkRepo(data.notifications);
}

export async function notificationsEffects(
	action: Events,
	state: NotificationsState,
) {
	if (action.domain !== "notifications") return;

	// Sync to local storage
	if (
		[
			"add-notification",
			"remove-notification",
			"clear-all",
			"set-notifications",
		].includes(action.type)
	) {
		localStorage.setItem("notifications", JSON.stringify(state));
	}

	switch (action.type) {
		case "check-repo":
			await checkRepo(state.notifications);
			break;
	}
}

async function checkRepo(currentNotifications: NotifyType[]) {
	try {
		const request = await fetch(
			"https://raw.githubusercontent.com/hollow-app/hollow-registry/refs/heads/main/notifications.json",
		);
		const text = await request.text();
		const parsed: NotifyType[] = JSON.parse(text);
		const newItems = parsed.filter((n) => {
			return (
				(([localStorage.platform, "all"].includes(n.platform) &&
					weekOld(n.submitted_at) &&
					!isExpired(n.expires_at)) ||
					n.id === "welcome-001") &&
				!currentNotifications.some((i) => i.id === n.id)
			);
		});

		if (newItems.length > 0) {
			newItems.forEach((n) => {
				_dispatch!({
					domain: "notifications",
					type: "add-notification",
					notification: n,
				});
			});
		}
	} catch (e) {
		console.log("Error", (e as Error).message);
	}
}
