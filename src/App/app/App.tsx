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

export default function App() {
	const [cards, setCards] = createStore<CardType[]>([]);

	const Container = createMemo(() => {
		const realm = manager.realm.getCurrent().id;
		const LazyContainer = lazy(async () => {
			if (!realm) return new Promise(() => {});
			await manager.hollow.postRealmSelection();
			return import("./Container");
		});
		return <LazyContainer />;
	});

	onMount(async () => {
		hollow.cards = () => cards;
		hollow.setCards = setCards;
	});

	return (
		<main class="app-container text-black dark:text-white">
			<Suspense fallback={<Loading />}>
				<Container />
			</Suspense>
			<Popups />
			<Alerts />
		</main>
	);
}
