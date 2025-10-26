import Canvas from "@components/ui/Canvas";
import Navbar from "@components/ui/sidebars/Navbar";
import { Opthand } from "@type/Opthand";
import { createSignal, lazy, onMount, Show, Suspense } from "solid-js";
import Notifications from "@components/ui/Notifications";
import SideBar from "@components/ui/SideBar";
import CharacterPanel from "@components/ui/sidebars/CharacterPanel";
import { hotkeysManager } from "@managers/HotkeysManager";
import { hollow } from "hollow";
const Settings = lazy(async () => import("@components/ui/Settings"));
const Expand = lazy(() => import("@components/ui/sidebars/Expand"));
const Editor = lazy(() => import("@components/ui/sidebars/Editor"));

function Container() {
	const [hand, setHand] = createSignal<Opthand[] | null>(
		hollow.toolManager.optimizeHand(),
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
	const toggleEditor = () => {
		setEditor((prev) => !prev);
	};
	onMount(() => {
		hollow.toolManager.setHand = setHand;
		hotkeysManager.getSelf().events["Toggle Settings"] = () =>
			setSettings((prev) => !prev);
		hotkeysManager.getSelf().events["Toggle Notifications"] = () =>
			setNotifications((prev) => !prev);
		hotkeysManager.getSelf().events["Toggle Expand"] = () =>
			setExpand((prev) => !prev);
		hotkeysManager.getSelf().events["Toggle Drag and Drop Mode"] = () => {
			document.getElementById("root").classList.toggle("dnd-mode");
			setDrag((prev) => !prev);
		};
	});
	return (
		<div class="bg-secondary flex h-full w-full flex-col px-2">
			<div class="relative flex h-full flex-1">
				<SideBar
					{...{
						isExpand,
						toggleExpand,
						toggleChara,
						setSettings,
						setDrag,
						isDrag,
						setNotifications,
						isEditor,
						toggleEditor,
					}}
				/>
				<Suspense>
					<Expand isVisible={isExpand} />
					<CharacterPanel isVisible={isChara} />
				</Suspense>
				<div class="relative flex max-h-full min-w-0 flex-1 flex-col">
					<Navbar />
					<div class="flex min-h-0 w-full flex-1 pb-2">
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
							<Editor
								isVisible={isEditor}
								setVisible={setEditor}
							/>
						</Suspense>
					</div>
				</div>
			</div>
			<Show when={isSettings()}>
				<Suspense>
					<Settings setSettings={setSettings} />
				</Suspense>
			</Show>
			<Notifications
				isVisible={isNotifications}
				setVisible={setNotifications}
			/>
		</div>
	);
}

export default Container;
