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

const Container = lazy(() => import("./Container"));
const Popups = lazy(() => import("@components/layout-ui/popups/Popups"));
const Alerts = lazy(() => import("@components/layout-ui/popups/Alerts"));

export default function App() {
	const { state } = useStore();
	const [ready, setReady] = createSignal(false);

	onMount(async () => {
		const realm = state.realm.current;
		if (!realm) return;
		await postRealmSelection(realm.location);
		setReady(true);
	});

	return (
		<main class="app-container text-black dark:text-white">
			<Suspense fallback={<Loading />}>
				<Show when={ready()} fallback={<Loading />}>
					<Container />
				</Show>
				<Popups />
				<Alerts />
			</Suspense>
		</main>
	);
}
