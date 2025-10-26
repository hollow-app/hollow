import Notifications from "@components/ui/Notifications";
import { NotifyType } from "@type/hollow";
import data from "emojibase-data/en/compact.json";
import { Setter } from "solid-js";
import { isExpired, weekOld } from "./manipulation/strings";
import { RealmManager } from "./RealmManager";
import { hollow } from "hollow";

type NotificationData = {
	lastUpdated: string;
	notifications: NotifyType[];
};

export class NotifyManager {
	private static self: NotifyManager;
	private key = `${RealmManager.getSelf().currentRealmId}-notifications`;
	public system: NotificationData = {
		lastUpdated: new Date().toISOString(),
		notifications: [],
	};
	static init() {
		this.self = new NotifyManager();
	}
	static getSelf() {
		if (!this.self) {
			this.init();
		}
		return this.self;
	}

	constructor() {
		//console.log('notify')
		const savedData = localStorage.getItem(this.key);
		if (savedData) {
			this.system = JSON.parse(savedData);
		} else {
			this.update();
		}
		// TODO needs to check network
		// this.checkRepo();
	}

	addNoty(noty: NotifyType) {
		this.system.notifications.push(noty);
		hollow.events.emit("notify-status", true);
		this.update();
	}
	removeNoty(id: string) {
		this.system.notifications = this.system.notifications.filter(
			(i) => i.id !== id,
		);
		if (this.system.notifications.length === 0) {
			hollow.events.emit("notify-status", false);
		}
		this.update();
	}
	clearAll() {
		this.system.notifications = [];
		hollow.events.emit("notify-status", false);
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
				//console.log(n.id)
				if (
					(([localStorage.platform, "all"].includes(n.platform) &&
						weekOld(n.submitted_at) &&
						!isExpired(n.expires_at)) ||
						n.id === "HX1-rS4v") &&
					!this.system.notifications.some((i) => i.id === n.id)
				) {
					hollow.events.emit("notify", n);
				}
			});
		} catch (e) {
			console.log("Error", e.message);
		}
	}

	update() {
		this.system = {
			...this.system,
			lastUpdated: new Date().toISOString(),
		};
		localStorage.setItem(this.key, JSON.stringify(this.system));
	}
}
