/* @refresh reload */
import "@styles/index.css";
import { render } from "solid-js/web";
import SelectorWindow from "./Selector";
import { preRealmSelection } from "../lib/app";
import { StoreProvider } from "./store";

function Root() {
	return (
		<StoreProvider>
			<SelectorWindow />
		</StoreProvider>
	);
}
async function ascend() {
	const root = document.getElementById("root");
	root.textContent = "";
	await preRealmSelection(true);
	console.log("Rendering SelectorWindow");
	render(() => <Root />, root);
}

ascend();
