import "@styles/index.css";
import { render } from "solid-js/web";
import { StoreProvider } from "@shared/store";
import { Show } from "solid-js";
import { useStore } from "@shared/store";
import Selector from "./Selector/Selector";
import { preRealmSelection } from "./lib/app";
import App from "@app/app/App";
import { TurnstileProvider } from "@component/Turnstile";

function Root() {
	const { state } = useStore();

	return (
		<Show when={state.realm.current} fallback={<Selector />}>
			<TurnstileProvider>
				<App />
			</TurnstileProvider>
		</Show>
	);
}

function Bootstrap() {
	return (
		<StoreProvider>
			<Root />
		</StoreProvider>
	);
}

const root = document.getElementById("root");
(async () => {
	await preRealmSelection();
	root.textContent = "";
	render(() => <Bootstrap />, root);
})();
