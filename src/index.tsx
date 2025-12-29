/* @refresh reload */
import "@styles/index.css";
import { render } from "solid-js/web";
import App from "./app/App";
import { manager } from "@managers/index";

async function ascend() {
	await manager.hollow.preRealmSelection();
	//
	const root = document.getElementById("root");
	root.textContent = "";
	render(() => <App />, root);
}

ascend();
