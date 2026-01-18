import { Suspense, createSignal, createEffect, lazy, Show } from "solid-js";
import Loading from "@components/ui/Loading";
import { getCurrentRealm } from "@managers/Realm";
import { postRealmSelection } from "../../Hollow/hollow";
import { StoreProvider } from "store";

const Container = lazy(() => import("./Container"));
const Popups = lazy(() => import("@components/layout-ui/popups/Popups"));
const Alerts = lazy(() => import("@components/layout-ui/popups/Alerts"));

export default function App() {
	const [ready, setReady] = createSignal(false);
	createEffect(async () => {
		const realm = getCurrentRealm();
		if (!realm) return;
		await postRealmSelection(realm.location);
		setReady(true);
	});
	return (
		<main class="app-container text-black dark:text-white">
			<Suspense fallback={<Loading />}>
				<StoreProvider>
					<Show when={ready()} fallback={<Loading />}>
						<Container />
					</Show>
					<Popups />
					<Alerts />
				</StoreProvider>
			</Suspense>
		</main>
	);
}
