import { manager } from "./index";
import { TagType } from "@type/hollow";
import { hollow } from "hollow";

export default function useTags(tags?: TagType[]) {
	let data: TagType[] = SettingsManager.getSelf().getConfig("custom-tags");
	if (tags) {
		data = tags;
		SettingsManager.getSelf().setConfig("custom-tags", tags);
	}
	hollow.events.emit("tags", data);
}
