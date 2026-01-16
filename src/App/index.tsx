/* @refresh reload */
import "@styles/index.css";
import { render } from "solid-js/web";
import App from "./app/App";
import { preRealmSelection } from "../Hollow/hollow";

async function ascend() {
	await preRealmSelection();

	const root = document.getElementById("root");
	root.textContent = "";

	console.log("Rendering main App");
	render(() => <App />, root);
}

ascend();
