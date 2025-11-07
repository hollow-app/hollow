import { NotifyType } from "@type/hollow";
import { isExpired, weekOld } from "./manipulation/strings";
import { RealmManager } from "./RealmManager";
import { hollow } from "hollow";

type NotificationData = {
	notifications: NotifyType[];
	alert: boolean;
};

export class NotifyManager {
	private static self: NotifyManager;
	private readonly key = `${RealmManager.getSelf().getCurrent()}-notifications`;
	private data: NotificationData = { alert: true, notifications: [] };

	static init() {
		this.self = new NotifyManager();
	}
	static getSelf() {
		if (!this.self) {
			this.init();
		}
		return this.self;
	}

	private constructor() {
		const savedData = localStorage.getItem(this.key);
		if (savedData) {
			this.data = JSON.parse(savedData);
		} else {
			this.update();
		}
		if (hollow.events.getCurrentData("network-state")) {
			// this.checkRepo();
		} else {
			const waitToFetch = (state: boolean) => {
				if (state) {
					// this.checkRepo();
					hollow.events.off("network-state", waitToFetch);
				}
			};
			hollow.events.on("network-state", waitToFetch);
		}
	}

	addNoty(noty: NotifyType) {
		this.data.notifications.push(noty);
		this.setAlert(true);
		this.update();
	}
	removeNoty(id: string) {
		this.data.notifications = this.data.notifications.filter(
			(i) => i.id !== id,
		);
		if (this.count() === 0) {
			this.setAlert(false);
		}
		this.update();
	}
	clearAll() {
		this.data.notifications = [];
		this.setAlert(false);
		this.update();
	}

	async checkRepo() {
		try {
			// TODO notifications.json is taking by the old version. 0.0.4 should be renamed to it.
			const request = await fetch(
				"https://raw.githubusercontent.com/hollow-app/hollow-registry/refs/heads/main/notify.json",
			);
			const text = await request.text();
			const parsed: (NotifyType & { platform: string })[] =
				JSON.parse(text);
			parsed.forEach((n) => {
				if (
					(([localStorage.platform, "all"].includes(n.platform) &&
						weekOld(n.submitted_at) &&
						!isExpired(n.expires_at)) ||
						n.id === "HX1-rS4v") &&
					!this.data.notifications.some((i) => i.id === n.id)
				) {
					this.addNoty(n);
				}
			});
		} catch (e) {
			console.log("Error", e.message);
		}
	}

	public count() {
		return this.data.notifications.length;
	}
	public getNotification() {
		return this.data.notifications;
	}
	public isAlert() {
		return this.data.alert;
	}
	public setAlert(v: boolean) {
		this.data.alert = v;
		hollow.events.emit("notify-status", v);
		this.update();
	}

	update() {
		if (this.data.notifications.length > 20) {
			this.data.notifications = this.data.notifications.slice(0, 21);
		}
		localStorage.setItem(this.key, JSON.stringify(this.data));
	}
}
