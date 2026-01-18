import {
	BoltIcon,
	ChevronDownIcon,
	ChevronsLeftRightIcon,
	XIcon,
} from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { close_window, maximize_window, minimize_window } from "@rust";

let timer: ReturnType<typeof setTimeout> | null = null;

type WindowControlProps = {
	expanded?: boolean;
	isSelector?: boolean;
};
export default function WindowControl({
	expanded,
	isSelector,
}: WindowControlProps) {
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
			class="window-control border-secondary-10 h-8 shrink-0 overflow-hidden rounded border bg-[var(--front)] transition-all duration-300"
			classList={{ "w-fit": isVisi(), "w-8": !isVisi() }}
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
						class="flex h-full w-full"
					>
						<button
							class="hover:bg-secondary-10 flex h-full w-8 shrink-0 items-center justify-center transition-opacity outline-none"
							classList={{
								"opacity-0": !isVisi(),
							}}
							onclick={() => minimize_window()}
						>
							<ChevronDownIcon class="size-6 p-1" />
						</button>
						<Show when={!isSelector}>
							<button
								class="hover:bg-secondary-10 flex h-full w-8 shrink-0 items-center justify-center outline-none"
								classList={{
									"opacity-0": !isVisi(),
								}}
								onclick={() => maximize_window()}
							>
								<ChevronsLeftRightIcon class="size-6 p-1" />
							</button>
						</Show>
						<button
							class="hover:bg-secondary-10 flex h-full w-8 shrink-0 items-center justify-center outline-none"
							classList={{
								"opacity-0": !isVisi(),
							}}
							onclick={() => close_window()}
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
