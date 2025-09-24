import Canvas from "@components/ui/Canvas";
import Navbar from "@components/ui/Navbar";
import { Opthand } from "@type/Opthand";
import { createSignal, lazy, onMount, Show, Suspense } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import Notifications from "@components/ui/Notifications";
const Settings = lazy(() => import("@components/ui/Settings"));
const Expand = lazy(() => import("@components/ui/Expand"));
const Editor = lazy(() => import("@components/ui/Editor"));

function Container() {
	const [hand, setHand] = createSignal<Opthand[] | null>(
		window.toolManager.optimizeHand(),
	);

	const [isExpand, setExpand] = createSignal(false);
	const [isEditor, setEditor] = createSignal(false);
	const [isSettings, setSettings] = createSignal(false);
	const [isDrag, setDrag] = createSignal(false);
	const [isNotifications, setNotifications] = createSignal(false);

	onMount(() => {
		window.toolManager.setHand = setHand;
		window.setEditor = setEditor;
		window.hotkeysManager.events["Toggle Settings"] = () =>
			setSettings((prev) => !prev);
		window.hotkeysManager.events["Toggle Notifications"] = () =>
			setNotifications((prev) => !prev);
		window.hotkeysManager.events["Toggle Expand"] = () =>
			setExpand((prev) => !prev);
		window.hotkeysManager.events["Toggle Drag and Drop Mode"] = () => {
			document.getElementById("root").classList.toggle("dnd-mode");
			setDrag((prev) => !prev);
		};
	});
	return (
		<div class="bg-secondary flex p-2 h-full w-full flex-col text-neutral-950 dark:text-neutral-200">
			<div class="relative flex flex-1 gap-2 ">
				<Suspense>
					<Expand isVisible={isExpand} setVisible={setExpand} />
				</Suspense>
				<div class="relative flex-1 flex flex-col overflow-hidden h-full">
					<Navbar
						setSettings={setSettings}
						setExpand={setExpand}
						isDrag={isDrag}
						setDrag={setDrag}
						setNotifications={setNotifications}
					/>
					<div class="flex-1 flex w-full relative">
						<Canvas
							isGridVisible={() =>
								isEditor() ||
								isExpand() ||
								isSettings() ||
								isDrag()
							}
							cards={hand}
						/>
						<Suspense>
							<Editor isVisible={isEditor} />
						</Suspense>
					</div>
				</div>
			</div>
			<Presence>
				<Show when={isSettings()}>
					<Motion
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{
							duration: 0.3,
						}}
					>
						<Suspense>
							<Settings setSettings={setSettings} />
						</Suspense>
					</Motion>
				</Show>
			</Presence>

			<Notifications
				isVisible={isNotifications}
				setVisible={setNotifications}
			/>
		</div>
	);
}

export default Container;
