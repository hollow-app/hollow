import { Suspense, createSignal, lazy, Show, onMount } from "solid-js";
import Loading from "@app/components/ui/Loading";
import { postRealmSelection } from "../../lib/app";
import { getCurrentRealm } from "@app/managers/Settings/effects.ts";

const Container = lazy(() => import("./Container"));
const Popups = lazy(() => import("@overlays/Popups"));
const Alerts = lazy(() => import("@overlays/Alerts"));

export default function App() {
	const [ready, setReady] = createSignal(false);

	onMount(async () => {
		const realm = getCurrentRealm();
		if (!realm) return;
		await postRealmSelection(realm.location);
		setReady(true);
	});

	return (
		<main class="app-container text-black dark:text-white">
			<Show when={ready()} fallback={<Loading />}>
				<Container />
			</Show>
			<Popups />
			<Alerts />
		</main>
	);
}
