import Popups from "@components/ui/popups/Popups";
import { manager } from "./index";
import {
	Suspense,
	createMemo,
	createSignal,
	lazy,
	Show,
	onMount,
} from "solid-js";
import Loading from "@components/Loading";
import Alerts from "@components/ui/popups/Alerts";

const Selector = lazy(() => import("@app/Selector"));

const selectRealmOnStartup = JSON.parse(
	localStorage.realmToggleOnStartup ?? "false",
);
export default function App() {
	const [selectedRealm, setSelectedRealm] = createSignal<string | null>(
		selectRealmOnStartup ? null : RealmManager.getSelf().currentRealmId,
	);

	const Container = createMemo(() => {
		const realm = selectedRealm();
		const LazyContainer = lazy(async () => {
			if (!realm) return new Promise(() => { });
			await HollowManager.getSelf().postRealmSelection();
			return import("./Container");
		});
		return <LazyContainer />;
	});
	const onSelect = (id: string) => {
		RealmManager.getSelf().enterRealm(id);
	};
	onMount(() => {
		RealmManager.getSelf().init(setSelectedRealm);
	});

	return (
		<main class="app-container text-black dark:text-white">
			<Show
				when={selectedRealm()}
				fallback={<Selector onSelect={onSelect} />}
			>
				<Suspense fallback={<Loading />}>
					<Container />
				</Suspense>
			</Show>
			<Popups />
			<Alerts />
		</main>
	);
}
