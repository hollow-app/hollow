/* @refresh reload */
import "@styles/index.css";
import { render } from "solid-js/web";
import SelectorWindow from "./Selector";
import { StoreProvider } from "@store";
import { preRealmSelection } from "../lib/app";

async function ascend() {
	const root = document.getElementById("root");
	root.textContent = "";
	await preRealmSelection();
	console.log("Rendering SelectorWindow");
	render(
		() => (
			<StoreProvider>
				<SelectorWindow />
			</StoreProvider>
		),
		root,
	);
}

ascend();
