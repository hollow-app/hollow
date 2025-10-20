import { FormType } from "@type/hollow";
import { HandType } from "@type/HandType";
import { createMemo, createSignal, lazy, onCleanup, onMount } from "solid-js";
import ContextMenu from "./ContextMenu";
import VaultStorage from "./VaultStorage";

const ColorPicker = lazy(() => import("@components/ColorPicker"));
const ConfirmPop = lazy(() => import("@components/ConfirmPop"));
const EmojiPicker = lazy(() => import("@components/EmojiPicker"));
const EntriesViewer = lazy(() => import("@components/EntriesViewer"));
const FormPop = lazy(() => import("@components/FormPop"));
const ToolPop = lazy(() => import("@components/ToolPop"));
const ToolSettings = lazy(() => import("./ToolSettings"));

export default function Popups() {
	const [tool, setTool] = createSignal<Omit<HandType, "cards">>(null);
	const [emoji, setEmoji] = createSignal<{
		emoji: string;
		setEmoji: (e: string) => void;
	}>();
	const [color, setColor] = createSignal<{
		color: string;
		setColor: (c: string) => void;
	}>(null);
	const [entries, setEntries] = createSignal<boolean>(null);
	const [form, setForm] = createSignal<FormType>(null);
	const [confirm, setConfirm] = createSignal(null);
	const [toolSettings, setToolSettings] = createSignal(null);
	const [vault, setVault] = createSignal<{ onSelect?: (p: string) => void }>(
		null,
	);
	const showEntries = () => {
		setEntries((prev) => !prev);
	};
	onMount(() => {
		window.hollowManager.on("tool-info", setTool);
		window.hollowManager.on("emoji-picker", setEmoji);
		window.hollowManager.on("color-picker", setColor);
		window.hollowManager.on("confirm", setConfirm);
		window.hollowManager.on("tool-settings", setToolSettings);
		window.hollowManager.on("show-entries", showEntries);
		window.hollowManager.on("show-vault", setVault);
		window.hollowManager.on("form", setForm);
	});

	onCleanup(() => {
		window.hollowManager.off("tool-info", setTool);
		window.hollowManager.off("emoji-picker", setEmoji);
		window.hollowManager.off("color-picker", setColor);
		window.hollowManager.off("confirm", setConfirm);
		window.hollowManager.off("tool-settings", setToolSettings);
		window.hollowManager.off("show-entries", showEntries);
		window.hollowManager.off("show-vault", setVault);
		window.hollowManager.off("form", setForm);
	});

	return (
		<div
			class={
				"pointer-events-none fixed top-0 left-0 flex h-full w-full items-center justify-center"
			}
		>
			<div id="hollow-popup" />
			{toolSettings() && <ToolSettings pluginSettings={toolSettings()} />}
			{tool() && <ToolPop tool={tool()} setTool={setTool} />}
			{entries() && <EntriesViewer />}
			{vault() && <VaultStorage {...vault()} />}
			{form() && <FormPop form={form} />}
			{emoji() && <EmojiPicker p={emoji()} />}
			{color() && <ColorPicker p={color()} />}
			{confirm() && <ConfirmPop pack={confirm()} />}
			<ContextMenu />
		</div>
	);
}
