/* @refresh reload */
import "@styles/index.css";
import { render } from "solid-js/web";
import SelectorWindow from "./SelectorWindow";
import { manager } from "@managers/index";

async function ascend() {
	const root = document.getElementById("root");
	root.textContent = "";

	console.log("Initializing RealmManager...");
	try {
		// Initialize realm manager (creates storage if needed)
		await manager.hollow.preRealmSelection();
		console.log("RealmManager initialized successfully");

		// Render SelectorWindow
		console.log("Rendering SelectorWindow");
		render(() => <SelectorWindow />, root);
	} catch (error) {
		console.error("Failed to initialize RealmManager:", error);
		// Show error in UI
		root.innerHTML = `<div style="color: white; padding: 20px;">
			<h2>Error initializing app</h2>
			<pre>${error.message || error}</pre>
		</div>`;
	}
}

ascend();
