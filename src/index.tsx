/* @refresh reload */
import "@styles/index.css";
import { render } from "solid-js/web";
import App from "./app/App";
import { SettingsManager } from "@managers/SettingsManager";
import { RealmManager } from "@managers/RealmManager";
import { HollowManager } from "@managers/HollowManager";

// TODO async
async function ascend() {
	await HollowManager.getSelf().preRealmSelection();
	//
	const root = document.getElementById("root");
	root.textContent = "";
	render(() => <App />, root);
}

ascend();
