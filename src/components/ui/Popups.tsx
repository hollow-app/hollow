import { FormType } from "@type/FormType";
import { HandType } from "@type/HandType";
import { createMemo, createSignal, lazy, onCleanup, onMount } from "solid-js";
import ContextMenu from "./ContextMenu";

const ColorPicker = lazy(() => import("@components/ColorPicker"));
const ConfirmPop = lazy(() => import("@components/ConfirmPop"));
const EmojiPicker = lazy(() => import("@components/EmojiPicker"));
const EntriesViewer = lazy(() => import("@components/EntriesViewer"));
const FormPop = lazy(() => import("@components/FormPop"));
const ToolPop = lazy(() => import("@components/ToolPop"));
const ToolSettings = lazy(() => import("./ToolSettings"));
const target = null;

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
	const visibleShadow = createMemo(
		() =>
			(confirm() && "6") ||
			(color() && "4") ||
			(emoji() && "4") ||
			(form() && "2") ||
			(entries() && "2") ||
			(tool() && "2") ||
			(toolSettings() && "0"),
	);
	//
	const showEntries = () => {
		setEntries((prev) => !prev);
	};
	onMount(() => {
		window.hollowManager.on("tool-info", setTool);
		window.hollowManager.on("EmojiPicker", setEmoji);
		window.hollowManager.on("ColorPicker", setColor);
		window.hollowManager.on("Confirm", setConfirm);
		window.hollowManager.on("tool-settings", setToolSettings);
		window.hollowManager.on("show-entries", showEntries);
		window.hollowManager.on("Form", setForm);
	});

	onCleanup(() => {
		window.hollowManager.off("tool-info", setTool);
		window.hollowManager.off("EmojiPicker", setEmoji);
		window.hollowManager.off("ColorPicker", setColor);
		window.hollowManager.off("Confirm", setConfirm);
		window.hollowManager.off("tool-settings", setToolSettings);
		window.hollowManager.off("show-entries", showEntries);
		window.hollowManager.off("Form", setForm);
	});

	return (
		<div
			class={
				"pointer-events-none fixed top-0 left-0 flex h-full w-full items-center justify-center"
			}
		>
			<div id="hollow-popup" />
			<div
				class="absolute inset-0 bg-black/50 opacity-0"
				classList={{ "opacity-100": !!visibleShadow() }}
				style={{ "z-index": visibleShadow() }}
			/>
			{toolSettings() && <ToolSettings pluginSettings={toolSettings()} />}

			{tool() && <ToolPop tool={tool()} setTool={setTool} />}
			{entries() && <EntriesViewer />}
			{form() && <FormPop form={form} />}

			{emoji() && <EmojiPicker p={emoji()} />}
			{color() && <ColorPicker p={color()} />}

			{confirm() && <ConfirmPop pack={confirm()} />}
			<ContextMenu />
		</div>
	);
}
