import { Suspense, createMemo, lazy } from "solid-js";
import Loading from "@components/ui/Loading";
import { getCurrentRealm } from "@managers/Realm";
import { postRealmSelection } from "../../Hollow/hollow";

const Popups = lazy(() => import("@components/layout-ui/popups/Popups"));
const Alerts = lazy(() => import("@components/layout-ui/popups/Alerts"));

export default function App() {
	const Container = createMemo(() => {
		const realm = getCurrentRealm();
		const LazyContainer = lazy(async () => {
			if (!realm) return new Promise(() => {});
			await postRealmSelection(realm.location);
			return import("./Container");
		});
		return <LazyContainer />;
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
