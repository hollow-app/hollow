import { RealmManager } from "@managers/RealmManager";
import { TagType } from "@type/hollow";
import { hollow } from "hollow";

export default function useTags(tags?: TagType[]) {
	const key = `${RealmManager.getSelf().currentRealmId}-tags`;
	const savedData = localStorage.getItem(key);
	let parsedData: TagType[] = [];
	if (savedData) {
		parsedData = tags ? tags : JSON.parse(savedData);
		tags && localStorage.setItem(key, JSON.stringify(tags));
	} else if (!savedData) {
		localStorage.setItem(key, JSON.stringify(parsedData));
	}
	hollow.events.emit("tags", parsedData);
}
