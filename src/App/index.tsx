import "@styles/index.css";
import { render } from "solid-js/web";
import { StoreProvider } from "./store";
import { createEffect, createResource, on, Show } from "solid-js";
import App from "@app/app/App";
import { TurnstileProvider } from "@component/Turnstile";
import { preRealmSelection } from "../lib/app";
import { get_current_realm } from "@rust";
import { hollow } from "hollow";

function Root() {
	const [realm] = createResource(async () => {
		const r = await get_current_realm();
		if (r) {
			hollow.realm = r;
		}
		return r;
	});

	// TODO make a better fallback ui;
	return (
		<Show when={realm()} fallback={<div></div>}>
			<StoreProvider>
				<TurnstileProvider>
					<App />
				</TurnstileProvider>
			</StoreProvider>
		</Show>
	);
}

// function Bootstrap() {
// 	return (
// 			<Root />
// 	);
// }

const root = document.getElementById("root");
(async () => {
	await preRealmSelection();
	root.textContent = "";
	render(() => <Root />, root);
})();
