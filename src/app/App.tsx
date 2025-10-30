import Popups from "@components/ui/popups/Popups";
import { RealmManager } from "@managers/RealmManager";
import {
	Suspense,
	createMemo,
	createSignal,
	lazy,
	Show,
	createResource,
	onMount,
} from "solid-js";
import Loading from "@components/Loading";
import { HollowManager } from "@managers/HollowManager";
import Alerts from "@components/ui/popups/Alerts";

const Selector = lazy(() => import("@app/Selector"));

export default function App() {
	const selectRealmOnStartup = createMemo(() =>
		JSON.parse(localStorage.realmToggleOnStartup ?? "false"),
	);
	const [selectedRealm, setSelectedRealm] = createSignal<string | null>(
		selectRealmOnStartup() ? null : localStorage.currentRealmId,
	);

	const [step1] = createResource(async () => {
		RealmManager.getSelf().init(setSelectedRealm);
		return await HollowManager.getSelf().preRealmSelection();
	});
	const Container = createMemo(() => {
		const realm = selectedRealm();
		const LazyContainer = lazy(async () => {
			if (!realm) return new Promise(() => {});
			await HollowManager.getSelf().postRealmSelection();
			return import("./Container");
		});
		return <LazyContainer />;
	});

	return (
		<main class="app-container text-black dark:text-white">
			<Show when={step1()} fallback={<Loading />}>
				<Show
					when={selectedRealm()}
					fallback={<Selector onSelect={setSelectedRealm} />}
				>
					<Suspense fallback={<Loading />}>
						<Container />
					</Suspense>
				</Show>
			</Show>
			<Popups />
			<Alerts />
		</main>
	);
}
