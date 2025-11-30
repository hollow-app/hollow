import { For, lazy, onMount, Show } from "solid-js";
import { createSignal } from "solid-js";
import { hollow } from "hollow";

import { ContextMenu } from "../ContextMenu";
import { Vault } from "./Vault";
import ToolSettings from "./ToolSettings";
import { ConfirmType, FormType } from "@type/hollow";

const ColorPicker = lazy(() => import("@components/ui/popups/ColorPicker"));
const Confirm = lazy(() => import("@components/ui/popups/Confirm"));
const EmojiPicker = lazy(() => import("@components/ui/popups/EmojiPicker"));
const EntriesViewer = lazy(() => import("@components/ui/popups/EntriesViewer"));
const Form = lazy(() => import("@components/ui/popups/Form"));
const ToolPop = lazy(() => import("@components/ui/popups/ToolPop"));
const Insight = lazy(() => import("@components/ui/popups/Insight"));

export default function Popups() {
	const [tool, setTool] = createSignal(null);
	const [emoji, setEmoji] = createSignal(null);
	const [color, setColor] = createSignal(null);
	const [entries, setEntries] = createSignal(false);
	const [form, setForm] = createSignal<FormType[]>([]);
	const [insight, setInsight] = createSignal(null);
	const [confirm, setConfirm] = createSignal<ConfirmType>(null);
	const [toolSettings, setToolSettings] = createSignal(null);
	const [vault, setVault] = createSignal(null);

	onMount(() => {
		hollow.events.on(
			"*",
			({ event, data }: { event: string; data: any }) => {
				switch (event) {
					case "tool-info":
						setTool(data);
						break;
					case "emoji-picker":
						setEmoji(data);
						break;
					case "color-picker":
						setColor(data);
						break;
					case "confirm":
						setConfirm(data);
						break;
					case "tool-settings":
						setToolSettings(data);
						break;
					case "show-entries":
						setEntries((prev) => !prev);
						break;
					case "show-vault":
						setVault(data);
						break;
					case "form":
						data && setForm((prev) => [...prev, data]);
						break;
					case "insight":
						setInsight(data);
						break;
				}
			},
		);
	});

	return (
		<div class="pointer-events-none fixed top-0 left-0 flex h-full w-full items-center justify-center">
			<div id="hollow-popup" />

			<Show when={toolSettings()}>
				<ToolSettings pluginSettings={toolSettings()} />
			</Show>

			<Show when={tool()}>
				<ToolPop tool={tool()} setTool={setTool} />
			</Show>

			<Show when={entries()}>
				<EntriesViewer />
			</Show>

			<Show when={vault()}>
				<Vault {...vault()} />
			</Show>

			<Show when={form().length > 0}>
				<For each={form()}>
					{(form) => <Form form={form} setForm={setForm} />}
				</For>
			</Show>

			<Show when={emoji()}>
				<EmojiPicker p={emoji()} />
			</Show>

			<Show when={color()}>
				<ColorPicker p={color()} />
			</Show>

			<Show when={insight()}>
				<Insight data={insight()} hide={() => setInsight(null)} />
			</Show>

			<Show when={confirm()}>
				<Confirm pack={confirm()} />
			</Show>

			<ContextMenu />
		</div>
	);
}
