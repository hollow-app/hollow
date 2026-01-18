import App from "@app/App";
import { Storage } from "@managers/Storage";
import { appConfigDir, join } from "@tauri-apps/api/path";
import { Realm } from "@type/Realm";
import { createRoot } from "solid-js";
import { render } from "solid-js/web";
import Selector from "../Selector/Selector";
type RealmsConfig = {
	current: string | null;
	realms: Realm[];
	selectOnStartup: boolean;
};
let store: Storage | null = null;
let currentRealm: Realm = null;
let dispose: () => void | null = null;
const root = document.getElementById("root");
export async function fetchRealms() {
	const path = await join(...[await appConfigDir(), "realms.json"]);
	store = await Storage.create({
		path,
		options: {
			defaults: {
				current: null,
				realms: [],
				selectOnStartup: false,
			},
		},
	});
	const data = store.getData() as RealmsConfig;
	currentRealm = data.realms.find((r) => r.id === data.current);
}
export function getCurrentRealm() {
	return currentRealm;
}
export function selectCurrentRealm(id: string) {
	const realm = (store.get("realms") as Realm[]).find((i) => i.id === id);
	if (realm) {
		store.set("current", id);
		currentRealm = realm;
	}
}
export function selectRealmOnStartup(): boolean {
	return store.get("select_on_startup") ?? false;
}
export function setSelectRealmOnStartup(value: boolean) {
	store.set("select_on_startup", value);
}

export function renderApp() {
	dispose = createRoot((dispose) => {
		render(() => <App />, root);
		return dispose;
	});
}
export function renderSelector() {
	dispose = createRoot((dispose) => {
		render(() => <Selector />, root);
		return dispose;
	});
}
