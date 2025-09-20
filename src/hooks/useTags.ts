import { TagType } from "@type/TagType";

export default function useTags(tags?: TagType[]) {
        const key = `${window.realmManager.currentRealmId}-tags`;
        const savedData = localStorage.getItem(key);
        let parsedData: TagType[] = [];
        if (savedData) {
                parsedData = tags ? tags : JSON.parse(savedData);
                tags && localStorage.setItem(key, JSON.stringify(tags));
        } else if (!savedData) {
                localStorage.setItem(key, JSON.stringify(parsedData));
        }
        window.hollowManager.emit("tags", parsedData);
}
