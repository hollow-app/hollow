import {
	Suspense,
	createSignal,
	createEffect,
	lazy,
	Show,
	onMount,
} from "solid-js";
import Loading from "@components/ui/Loading";
import { useStore } from "@shared/store";
import { postRealmSelection } from "../../lib/app";
import { getCurrentRealm } from "@shared/managers/Realm";

const Container = lazy(() => import("./Container"));
const Popups = lazy(() => import("@components/layout-ui/popups/Popups"));
const Alerts = lazy(() => import("@components/layout-ui/popups/Alerts"));

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
			<Suspense>
				{/* <Show when={ready()} fallback={<Loading />}> */}
				{/* 	<Container /> */}
				{/* </Show> */}
				<Popups />
				<Alerts />
			</Suspense>
		</main>
	);
}
