import Canvas from "@components/ui/Canvas";
import Navbar from "@components/ui/Navbar";
import { Opthand } from "@type/Opthand";
import { createSignal, lazy, onMount, Show, Suspense } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import Notifications from "@components/ui/Notifications";
import SideBar from "@components/ui/SideBar";
import CharacterPanel from "@components/ui/CharacterPanel";
const Settings = lazy(() => import("@components/ui/Settings"));
const Expand = lazy(() => import("@components/ui/Expand"));
const Editor = lazy(() => import("@components/ui/Editor"));

function Container() {
	const [hand, setHand] = createSignal<Opthand[] | null>(
		window.toolManager.optimizeHand(),
	);

	const [isChara, setChara] = createSignal(false);
	const [isExpand, setExpand] = createSignal(false);
	const [isEditor, setEditor] = createSignal(false);
	const [isSettings, setSettings] = createSignal(false);
	const [isDrag, setDrag] = createSignal(false);
	const [isNotifications, setNotifications] = createSignal(false);

	const toggleExpand = () => {
		if (isChara()) {
			setChara(false);
		}
		setExpand((prev) => !prev);
	};
	const toggleChara = () => {
		if (isExpand()) {
			setExpand(false);
		}
		setChara((prev) => !prev);
	};

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
		<div class="bg-secondary flex px-2 pb-2 h-full w-full flex-col text-neutral-950 dark:text-neutral-200">
			<div class="relative flex flex-1 h-full">
				<SideBar
					{...{
						isExpand,
						toggleExpand,
						toggleChara,
						setSettings,
						setDrag,
						isDrag,
						setNotifications,
					}}
				/>
				<Suspense>
					<Expand isVisible={isExpand} />
					<CharacterPanel isVisible={isChara} />
				</Suspense>
				<div class="relative flex-1 flex flex-col max-h-full min-w-0">
					<Navbar />
					<div class="flex-1 flex w-full min-h-0">
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
			<Show when={isSettings()}>
				<Settings setSettings={setSettings} />
			</Show>
			<Notifications
				isVisible={isNotifications}
				setVisible={setNotifications}
			/>
		</div>
	);
}

export default Container;
