import Popups from "@components/ui/popups/Popups";
import { manager } from "@managers/index";
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
import { createStore } from "solid-js/store";
import { hollow } from "hollow";
import { CardType } from "@type/hollow";

const Selector = lazy(() => import("@app/Selector"));

const selectRealmOnStartup = JSON.parse(
	localStorage.realmToggleOnStartup ?? "false",
);
export default function App() {
	const [selectedRealm, setSelectedRealm] = createSignal<string | null>(
		selectRealmOnStartup ? null : manager.realm.currentRealmId,
	);
	const [cards, setCards] = createStore<CardType[]>([]);

	const Container = createMemo(() => {
		const realm = selectedRealm();
		const LazyContainer = lazy(async () => {
			if (!realm) return new Promise(() => {});
			await manager.hollow.postRealmSelection();
			return import("./Container");
		});
		return <LazyContainer />;
	});

	const onSelect = (id: string) => {
		manager.realm.enterRealm(id);
	};
	onMount(() => {
		manager.realm.init(setSelectedRealm);
		hollow.cards = () => cards;
		hollow.setCards = setCards;
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
