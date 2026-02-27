import { Character } from "@app/type/Character";
import { UserIcon } from "lucide-solid";
import { Show } from "solid-js";

interface Props {
	user: Partial<Character>;
}
export function Avatar(props: Props) {
	return (
		<div class="pointer-events-auto relative">
			<div class="group border-secondary-20 bg-secondary-05 relative h-20 w-20 overflow-hidden rounded-2xl border-3 object-cover shadow-lg">
				<Show
					when={props.user.identity.avatar}
					fallback={
						<UserIcon class="box-border size-full p-2 text-neutral-400" />
					}
				>
					<img
						class="size-full object-cover"
						src={props.user.identity.avatar}
						alt={props.user.identity.name}
					/>
				</Show>
			</div>
			<Show when={props.user.level}>
				<div class="bg-secondary-90 text-secondary border-secondary absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-lg border-2 text-xs font-bold shadow-sm">
					{props.user.level.total}
				</div>
			</Show>
		</div>
	);
}
