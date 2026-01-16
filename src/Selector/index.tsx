/* @refresh reload */
import "@styles/index.css";
import { render } from "solid-js/web";
import SelectorWindow from "./SelectorWindow";
import { preRealmSelection } from "../Hollow/hollow";
import { StoreProvider } from "./store";

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
