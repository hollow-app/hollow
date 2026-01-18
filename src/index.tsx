import { render } from "solid-js/web";
import { StoreProvider } from "@shared/store";
import { Show } from "solid-js";
import { useStore } from "@shared/store";
import App from "@app/App";
import Selector from "./Selector/Selector";

function Root() {
	const { state } = useStore();

	return (
		<Show when={state.realm.current} fallback={<Selector />}>
			<App />
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
render(() => <Bootstrap />, root);
