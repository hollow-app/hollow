import { FormType, InsightType } from "@type/hollow";
import { HandType } from "@type/HandType";
import { createSignal, lazy, onCleanup, onMount, Show } from "solid-js";
import ContextMenu from "../ContextMenu";
import VaultStorage from "./VaultStorage";
import { hollow } from "hollow";

const ColorPicker = lazy(() => import("@components/ui/popups/ColorPicker"));
const ConfirmPop = lazy(() => import("@components/ui/popups/ConfirmPop"));
const EmojiPicker = lazy(() => import("@components/ui/popups/EmojiPicker"));
const EntriesViewer = lazy(() => import("@components/ui/popups/EntriesViewer"));
const FormPop = lazy(() => import("@components/ui/popups/FormPop"));
const ToolPop = lazy(() => import("@components/ui/popups/ToolPop"));
const ToolSettings = lazy(() => import("./ToolSettings"));
const InsightPop = lazy(() => import("@components/ui/popups/InsightPop"));

export default function Popups() {
	const [tool, setTool] = createSignal<Omit<HandType, "cards">>(null);
	const [emoji, setEmoji] = createSignal<{
		emoji: string;
		setEmoji: (e: string) => void;
	}>(null);
	const [color, setColor] = createSignal<{
		color: string;
		setColor: (c: string) => void;
	}>(null);
	const [entries, setEntries] = createSignal<boolean>(false);
	const [form, setForm] = createSignal<FormType>(null);
	const [insight, setInsight] = createSignal<InsightType>(null);
	const [confirm, setConfirm] = createSignal(null);
	const [toolSettings, setToolSettings] = createSignal(null);
	const [vault, setVault] = createSignal<{ onSelect?: (p: string) => void }>(
		null,
	);
	const showEntries = () => {
		setEntries((prev) => !prev);
	};
	onMount(() => {
		hollow.events.on("tool-info", setTool);
		hollow.events.on("emoji-picker", setEmoji);
		hollow.events.on("color-picker", setColor);
		hollow.events.on("confirm", setConfirm);
		hollow.events.on("tool-settings", setToolSettings);
		hollow.events.on("show-entries", showEntries);
		hollow.events.on("show-vault", setVault);
		hollow.events.on("form", setForm);
		hollow.events.on("insight", setInsight);
	});

	onCleanup(() => {
		hollow.events.off("tool-info", setTool);
		hollow.events.off("emoji-picker", setEmoji);
		hollow.events.off("color-picker", setColor);
		hollow.events.off("confirm", setConfirm);
		hollow.events.off("tool-settings", setToolSettings);
		hollow.events.off("show-entries", showEntries);
		hollow.events.off("show-vault", setVault);
		hollow.events.off("form", setForm);
		hollow.events.off("insight", setInsight);
	});

	return (
		<div
			class={
				"pointer-events-none fixed top-0 left-0 flex h-full w-full items-center justify-center"
			}
		>
			<div id="hollow-popup" />
			<Show when={toolSettings()}>
				<ToolSettings pluginSettings={toolSettings()} />
			</Show>
			{tool() && <ToolPop tool={tool()} setTool={setTool} />}
			{entries() && <EntriesViewer />}
			{vault() && <VaultStorage {...vault()} />}
			{form() && <FormPop form={form} />}
			{emoji() && <EmojiPicker p={emoji()} />}
			{color() && <ColorPicker p={color()} />}
			<Show when={insight()}>
				<InsightPop data={insight} hide={() => setInsight(null)} />
			</Show>
			{confirm() && <ConfirmPop pack={confirm()} />}
			<ContextMenu />
		</div>
	);
}
