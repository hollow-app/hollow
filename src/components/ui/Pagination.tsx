import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid";
import { createSignal } from "solid-js";
import { Show } from "solid-js";

interface Props {
	length: number;
	perPage: number;
}
export function Pagination(props: Props) {
	const [start, setStart] = createSignal(0);

	return (
		<Show when={props.length > props.perPage}>
			<div class="flex items-center justify-between gap-5 px-2 pt-2 pb-1">
				<div class="text-secondary-40 text-xs font-medium">
					Showing {start() + 1}-
					{Math.min(start() + props.perPage, props.length)} of{" "}
					{props.length}
				</div>
				<div class="flex items-center gap-2">
					<button
						class="button-control disabled:opacity-50"
						disabled={start() === 0}
						onclick={() =>
							setStart(Math.max(0, start() - props.perPage))
						}
					>
						<ChevronLeftIcon class="size-4" />
					</button>
					<span class="text-secondary-60 text-xs font-medium">
						Page {Math.floor(start() / props.perPage) + 1} of{" "}
						{Math.ceil(props.length / props.perPage)}
					</span>
					<button
						class="button-control disabled:opacity-50"
						disabled={start() + props.perPage >= props.length}
						onclick={() => setStart(start() + props.perPage)}
					>
						<ChevronRightIcon class="size-4" />
					</button>
				</div>
			</div>
		</Show>
	);
}
