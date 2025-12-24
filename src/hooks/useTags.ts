import { manager } from "@managers/index";
import { TagType } from "@type/hollow";
import { hollow } from "hollow";

export default function useTags(tags?: TagType[]) {
	let data: TagType[] = manager.settings.getConfig("custom-tags");
	if (tags) {
		data = tags;
		manager.settings.setConfig("custom-tags", tags);
	}
	hollow.events.emit("tags", data);
}
