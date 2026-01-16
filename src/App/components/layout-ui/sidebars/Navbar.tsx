import { createSignal, Show } from "solid-js";
import WindowControl from "@components/ui/WindowControl";
import { Motion, Presence } from "solid-motionone";

export default function Navbar() {
	const [visible, setVisible] = createSignal(false);
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
			class="titlebar border-secondary-10 top-0 right-0 ml-auto flex min-h-2 w-full items-center justify-end overflow-hidden opacity-0"
			style={{
				height: visible()
					? "calc(var(--spacing) * 12)"
					: "calc(var(--spacing) * 2)",
			}}
			classList={{ "opacity-100": visible() }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<WindowControl />
		</div>
	);
}
