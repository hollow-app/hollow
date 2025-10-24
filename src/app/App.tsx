import Popups from "@components/ui/Popups";
import { HollowManager } from "@managers/HollowManager";
import { initialization1, initialization2 } from "@managers/init";
import { RealmManager } from "@managers/RealmManager";
import {
	Suspense,
	createSignal,
	lazy,
	Show,
	createEffect,
	createResource,
} from "solid-js";
import { RustManager } from "@managers/RustManager";
import Loading from "@components/Loading";

const Selector = lazy(() => import("@app/Selector"));

const selectRealmOnStartup = JSON.parse(
	localStorage.realmToggleOnStartup ?? "false",
);

const [selectedRealm, setSelectedRealm] = createSignal<string | null>(
	selectRealmOnStartup ? null : localStorage.currentRealmId,
);
window.hollowManager = new HollowManager();
window.realmManager = new RealmManager(setSelectedRealm);

function Container() {
	const realm = selectedRealm();
	const LazyContainer = lazy(async () => {
		if (!realm) return new Promise(() => {});
		await initialization2();
		return import("./Container");
	});
	return <LazyContainer />;
}

export default function App() {
	const [step1] = createResource(async () => await initialization1());

	createEffect(() => {
		if (!selectedRealm()) {
			window.addEventListener("keydown", onKeyDown);
		} else {
			window.removeEventListener("keydown", onKeyDown);
		}
	});
	const onKeyDown = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.key === "r") {
			RustManager.getSelf().reload();
		}
	};
	return (
		<main class="app-container text-black dark:text-white">
			<Suspense fallback={<Loading />}>
				<Show when={step1()}>
					<Show
						when={selectedRealm()}
						fallback={<Selector onSelect={setSelectedRealm} />}
					>
						<Suspense fallback={<Loading />}>
							<Container />
						</Suspense>
					</Show>
				</Show>
			</Suspense>

			<Popups />
		</main>
	);
}
