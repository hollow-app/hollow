import Hollow from "@assets/logo.svg";
import {
	Component,
	createMemo,
	For,
	JSX,
	onMount,
	Setter,
	Show,
} from "solid-js";
import { hollow } from "../../../hollow";
import { MyIconFun } from "@app/components/ui/MyIcon";
import { DynamicIcon } from "@app/components/ui/DynamicIcon";
import { guide } from "@app/utils/help";
import { useStore } from "@store";
import { registerHotkeyEvent } from "@app/managers/Hotkeys";
import {
	getLayoutCore,
	isPanelVisible,
	selectPanel,
} from "@app/managers/layout";
import { toggleVault } from "@app/context/actions";
import { SaladIcon, UserCogIcon } from "lucide-solid";
import ToolIcon from "../ui/ToolIcon";
import { Button } from "@ui";

interface SideBarButton {
	id: string;
	Icon: string | Component;
	onClick: () => void;
	tooltip?: string;
	selectedCondition?: () => boolean;
	style?: JSX.CSSProperties;
	class?: string;
}

type SideBarProps = {};
export default function SideBar(props: SideBarProps) {
	const { state, dispatch } = useStore();
	const alert = createMemo(
		() => state.notifications.notifications.length > 0,
	);
	const anyExtraPanels = createMemo(() => {
		const layout = state.layout;
		return layout.left.panels.length > 2 || layout.right.panels.length > 2;
	});

	const toggleDnd = () => {
		dispatch({
			domain: "context",
			type: "toggle-live-editor",
		});
	};

	const top: SideBarButton[] = [
		{
			id: "expand-btn",
			Icon: MyIconFun({ name: "home-2-fill" }),
			onClick: () => selectPanel("left", "expand"),
			selectedCondition: () => isPanelVisible(state, "left", "expand"),
		},
		{
			id: "editor-btn",
			Icon: MyIconFun({ name: "designtools-fill" }),
			onClick: () => selectPanel("right", "editor"),
			selectedCondition: () => isPanelVisible(state, "right", "editor"),
		},
		{
			id: "vault-btn",
			Icon: MyIconFun({ name: "strongbox-fill" }),
			onClick: () => toggleVault(),
		},
	];
	const bottom: SideBarButton[] = [
		{
			id: "canvas-editor-btn",
			Icon: MyIconFun({ name: "pen-tool-fill" }),
			onClick: toggleDnd,
			selectedCondition: () => state.context.isLiveEditor,
			tooltip: "Edit cards directly in the canvas",
		},
		{
			id: "account-btn",
			Icon: MyIconFun({ name: "user" }),
			onClick: () => selectPanel("left", "account"),
			selectedCondition: () => isPanelVisible(state, "left", "account"),
		},
		{
			id: "notifications-btn",
			Icon: MyIconFun({ name: "bell-fill" }),
			onClick: () => selectPanel("right", "notifications"),
			selectedCondition: () =>
				isPanelVisible(state, "right", "notifications"),
			style: {
				"--opacity": "var(--alert)",
			},
		},
		{
			id: "settings-btn",
			Icon: MyIconFun({ name: "gear-fill" }),
			onClick: () =>
				dispatch({ domain: "context", type: "toggle-settings" }),
		},
	];
	onMount(() => {
		registerHotkeyEvent("Toggle Drag and Drop Mode", toggleDnd);

		if (!localStorage.guide) {
			guide();
			localStorage.guide = "true";
		}
	});

	return (
		<div
			id="sidebar"
			class="border-secondary-10 my-2 mr-2 box-content flex w-13 shrink-0 flex-col gap-4 rounded-xl border-r-0 bg-[var(--front)] py-2"
			style={{
				"--alert": alert() ? "0.9" : "0.5",
			}}
		>
			<button class="outline-none">
				<Hollow class="orbit mx-auto size-8" />
			</button>
			<div class="mx-auto flex flex-col gap-3">
				<For each={top}>{(btn) => <ControlButton {...btn} />}</For>
			</div>
			<Show when={anyExtraPanels()}>
				<div class="bg-secondary-10 mx-auto flex flex-col gap-3 rounded-lg p-1">
					<For
						each={[
							...state.layout.left.panels,
							...state.layout.right.panels,
						]}
					>
						{(id) => {
							const layoutMeta = (
								getLayoutCore().left[id] ||
								getLayoutCore().right[id]
							).meta;
							if (!layoutMeta) return;
							return (
								<ControlButton
									id={layoutMeta.id}
									Icon={layoutMeta.icon}
									tooltip={layoutMeta.tooltip}
									selectedCondition={() =>
										isPanelVisible(
											state,
											layoutMeta.variant,
											layoutMeta.id,
										)
									}
									onClick={() =>
										selectPanel(
											layoutMeta.variant,
											layoutMeta.id,
										)
									}
								/>
							);
						}}
					</For>
				</div>
			</Show>
			{/* bottom */}
			<div class="z-1 mx-auto mt-auto flex flex-col gap-2">
				<For each={bottom}>{(btn) => <ControlButton {...btn} />}</For>
			</div>
		</div>
	);
}

const ControlButton = (btn: SideBarButton) => {
	return (
		<div>
			<div
				classList={{
					"tool-tip": !!btn.tooltip,
				}}
			>
				<Show when={btn.tooltip}>
					<span data-side="right" class="tool-tip-content">
						{btn.tooltip}
					</span>
				</Show>
				<Button.Root
					id={btn.id}
					class={btn.class}
					variant="ghost"
					style={{
						"--size": "calc(var(--spacing) * 8)",
						...(btn.style ?? {}),
					}}
					selected={btn.selectedCondition && btn.selectedCondition()}
					onclick={btn.onClick}
					icon
				>
					<Show
						when={typeof btn.Icon !== "string"}
						fallback={
							<ToolIcon
								toolName={btn.Icon as string}
								class="size-4.5"
							/>
						}
					>
						<DynamicIcon
							icon={btn.Icon ?? SaladIcon}
							class="m-auto size-4.5"
						/>
					</Show>
				</Button.Root>
			</div>
		</div>
	);
};
