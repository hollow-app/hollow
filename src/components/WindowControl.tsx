import { manager } from "./index";
import {
	BoldIcon,
	BoltIcon,
	ChevronDownIcon,
	ChevronsLeftRightIcon,
	RussianRuble,
	XIcon,
} from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";

let timer: ReturnType<typeof setTimeout> | null = null;

type WindowControlProps = {
	expanded?: boolean;
};
export default function WindowControl({ expanded }: WindowControlProps) {
	const [isVisi, setVisi] = createSignal(expanded);

	const handleMouseOn = () => {
		if (expanded) return;
		setVisi(true);
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const handleMouseOff = () => {
		if (expanded) return;
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			setVisi(false);
			timer = null;
		}, 4000);
	};

	return (
		<div
			onMouseEnter={handleMouseOn}
			onMouseLeave={handleMouseOff}
			class="window-control bg-secondary-05 border-secondary-10 h-8 overflow-hidden rounded border-1 transition-all duration-300"
			classList={{ "w-24": isVisi(), "w-8": !isVisi() }}
		>
			<Presence exitBeforeEnter>
				<Show when={isVisi()}>
					<Motion.div
						initial={{
							opacity: "0%",
						}}
						animate={{
							opacity: "100%",
							transition: {
								delay: 0.1,
							},
						}}
						exit={{ opacity: "0%" }}
						transition={{
							duration: 0.3,
						}}
						class="grid h-full w-full grid-cols-[1fr_1fr_1fr]"
					>
						<button
							class="hover:bg-secondary-10 flex h-full w-full items-center justify-center transition-opacity"
							classList={{
								"opacity-0": !isVisi(),
							}}
							onclick={() =>
								RustManager.getSelf().minimize_window()
							}
						>
							<ChevronDownIcon class="size-6 p-1" />
						</button>
						<button
							class="hover:bg-secondary-10 flex h-full w-full items-center justify-center"
							classList={{
								"opacity-0": !isVisi(),
							}}
							onclick={() =>
								RustManager.getSelf().maximize_window()
							}
						>
							<ChevronsLeftRightIcon class="size-6 p-1" />
						</button>
						<button
							class="hover:bg-secondary-10 flex h-full w-full items-center justify-center"
							classList={{
								"opacity-0": !isVisi(),
							}}
							onclick={() => RustManager.getSelf().close_window()}
						>
							<XIcon class="size-6 p-1" />
						</button>
					</Motion.div>
				</Show>
				<Show when={!isVisi()}>
					<Motion.div
						initial={{
							opacity: "0%",
						}}
						animate={{
							opacity: "100%",
						}}
						exit={{ opacity: "0%" }}
						transition={{
							duration: 0.3,
						}}
					>
						<BoltIcon class="m-auto h-full max-h-8 w-full max-w-8 p-1.5" />
					</Motion.div>
				</Show>
			</Presence>
		</div>
	);
}
