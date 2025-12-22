import { hotkeysManager } from "@managers/HotkeysManager";
import { ConfirmType } from "@type/hollow";
import { hollow } from "hollow";
import { onMount } from "solid-js";
type ConfirmPopProps = {
	pack: ConfirmType;
};

export default function ConfirmPop({ pack }: ConfirmPopProps) {
	const decision = (d: boolean) => {
		if (d) {
			pack.onAccept();
		} else if (pack.onRefuse) {
			pack.onRefuse();
		}
		hollow.events.emit("confirm", null);
	};

	onMount(() => {
		hotkeysManager.getSelf().events["Accept Confirm Message"] = () =>
			decision(true);
		hotkeysManager.getSelf().events["Refuse Confirm Message"] = () =>
			decision(false);
	});
	return (
		<div class="bg-secondary popup-shadow pointer-events-auto absolute z-90 h-fit w-fit max-w-[90%] rounded-xl p-1 text-gray-950 md:max-w-[60%] dark:text-gray-200">
			<div class="border-secondary-10 rounded-xl border border-dashed p-9">
				<h1 class="mb-3 text-3xl font-bold capitalize">{pack.title}</h1>
				<p class="w-full whitespace-pre-line text-neutral-500">
					{pack.message}
				</p>
				<div class="mt-10 flex w-full justify-between gap-3">
					<button
						class="button primary flex-1"
						onclick={() => decision(true)}
					>
						{pack.accLabel ?? "Confirm"}
					</button>
					<button
						class="button secondary flex-1"
						onclick={() => decision(false)}
					>
						{pack.refLabel ?? "Cancel"}
					</button>
				</div>
			</div>
		</div>
	);
}
