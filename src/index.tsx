import "@styles/index.css";
import { fetchRealms, renderApp, renderSelector } from "./Hollow/realm";
import { getCurrentRealm } from "@managers/Realm";

async function ascend() {
	await fetchRealms();
	const currentRealm = getCurrentRealm();
	if (currentRealm) {
		renderApp();
	} else {
		renderSelector();
	}
}
ascend();
