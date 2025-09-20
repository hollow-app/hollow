import Popups from "@components/ui/Popups";
import { HollowManager } from "@managers/HollowManager";
import { init } from "@managers/init";
import { RealmManager } from "@managers/RealmManager";
import { Suspense, createSignal, lazy, Show, createEffect } from "solid-js";
import { RustManager } from "@managers/RustManager";

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
                await init();

                return import("./Container");
        });

        return <LazyContainer />;
}

export default function App() {
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
                <main class="app-container">
                        <Show
                                when={selectedRealm()}
                                fallback={
                                        <Selector onSelect={setSelectedRealm} />
                                }
                        >
                                <Suspense
                                        fallback={
                                                <div class="flex h-full w-full items-center justify-center">
                                                        <div class="chaotic-orbit" />
                                                </div>
                                        }
                                >
                                        <Container />
                                </Suspense>
                        </Show>
                        <Popups />
                </main>
        );
}

// render(() => <App />, document.getElementById("root") as HTMLElement);
