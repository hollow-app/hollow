import { createMemo, createSignal, Show } from "solid-js";
import WindowControl from "@app/components/ui/WindowControl";
import { Button, Separator, Tooltip } from "@ui";
import { LockIcon } from "lucide-solid";
import MyIcon from "@app/components/ui/MyIcon";
const AUTO_HIDE_KEY = "title_bar_auto_hide";
export default function Navbar() {
	const [visible, setVisible] = createSignal(false);
	const [autoHide, setAutoHide] = createSignal(
		!!localStorage.getItem(AUTO_HIDE_KEY),
	);
	const locked = createMemo(() => visible() || autoHide());
	let hideTimer: number | undefined;

	const handleMouseEnter = () => {
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = undefined;
		}
		setVisible(true);
	};

	const handleMouseLeave = () => {
		hideTimer = window.setTimeout(() => {
			setVisible(false);
			hideTimer = undefined;
		}, 1000);
	};

	const handleSwitchAutoHide = () => {
		const state = !autoHide();
		if (state) {
			localStorage.setItem(AUTO_HIDE_KEY, "enable");
		} else {
			localStorage.removeItem(AUTO_HIDE_KEY);
		}
		setAutoHide(state);
	};

	return (
		<div class="titlebar border-secondary-10 relative top-0 right-0 ml-auto flex min-h-2 w-full items-center">
			<Show when={locked()}>
				<div class="my-2 flex h-10 w-full rounded-xl bg-[var(--front)] px-1">
					<div class="ml-auto flex items-center gap-2">
						<WindowControl />
					</div>
				</div>
			</Show>
			<Show when={visible()}>
				<div class="animate-slide-down fixed top-10 z-2 flex w-full justify-center">
					<Button.Root
						variant="ghost"
						onclick={handleSwitchAutoHide}
						style={{
							"--background": "var(--color-secondary-10)",
						}}
						selected={!autoHide()}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
					>
						<LockIcon class="size-4.5" /> Auto-Hide
					</Button.Root>
				</div>
			</Show>
			<div
				class="absolute top-0 h-2 w-full"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			></div>
		</div>
	);
}
