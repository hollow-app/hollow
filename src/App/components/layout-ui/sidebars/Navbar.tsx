import { createMemo, createSignal } from "solid-js";
import WindowControl from "@app/components/ui/WindowControl";
import { Button } from "@ui";
import { LockIcon } from "lucide-solid";

export default function Navbar() {
	const [visible, setVisible] = createSignal(false);
	const [locked, setLocked] = createSignal(false);
	const autoHide = createMemo(() => visible() || locked());
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

	return (
		<div
			class="titlebar border-secondary-10 top-0 right-0 ml-auto flex min-h-2 w-full items-center overflow-hidden opacity-0"
			style={{
				height: autoHide()
					? "calc(var(--spacing) * 12)"
					: "calc(var(--spacing) * 2)",
			}}
			classList={{ "opacity-100": autoHide() }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div class="ml-auto flex items-center gap-2">
				<button
					class="button-control"
					onclick={() => {
						setLocked((p) => !p);
					}}
					classList={{ selected: locked() }}
				>
					<LockIcon class="size-4" />
				</button>
				<WindowControl />
			</div>
		</div>
	);
}
