import { NotifyType } from "@type/NotifyType";
import { isExpired, weekOld } from "../utils/manipulation/strings";
import { hollow } from "hollow";
import { Managers } from ".";
import { ReactiveManager } from "./ReactiveManager";

type NotificationData = {
	notifications: NotifyType[];
	alert: boolean;
};

export class NotifyManager extends ReactiveManager<NotificationData> {
	constructor() {
		const savedData = localStorage.getItem("notifications");
		const data = savedData
			? JSON.parse(savedData)
			: { notifications: [], alert: false };
		super(data);
		this.checkRepo();
		this.subscribe((v) => {
			localStorage.setItem("notifications", JSON.stringify(v));
		});
	}

	addNoty(noty: NotifyType) {
		this.set = {
			notifications: [...this.get.notifications, noty],
			alert: true,
		};
	}
	removeNoty(id: string) {
		const newNotifications = this.get.notifications.filter(
			(i) => i.id !== id,
		);
		this.set = {
			notifications: newNotifications,
			alert: newNotifications.length === 0 ? false : this.get.alert,
		};
	}
	clearAll() {
		this.set = {
			notifications: [],
			alert: false,
		};
	}

	async checkRepo() {
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
					!this.get.notifications.some((i) => i.id === n.id)
				);
			});
			this.set = {
				notifications: [...this.get.notifications, ...newItems],
				alert: newItems.length > 0 ? true : this.get.alert,
			};
		} catch (e) {
			console.log("Error", e.message);
		}
	}
}
