import { ConfirmType } from "@type/ConfirmType";
import { marked } from "marked";
import { createResource, onMount, Suspense } from "solid-js";
type ConfirmPopProps = {
	pack: ConfirmType;
};

export default function ConfirmPop({ pack }: ConfirmPopProps) {
	const decision = (d: boolean) => {
		d && pack.onAccept();
		window.hollowManager.emit("confirm", null);
	};

	onMount(() => {
		window.hotkeysManager.events["Accept Confirm Message"] = () =>
			decision(true);
		window.hotkeysManager.events["Refuse Confirm Message"] = () =>
			decision(false);
	});
	return (
		<div class="bg-secondary-05 border-secondary-15 pointer-events-auto absolute z-9 h-fit w-fit max-w-[90%] rounded-xl border-1 p-10 text-gray-950 md:max-w-[60%] dark:text-gray-200">
			<h1 class="mb-3 text-3xl font-bold capitalize">{pack.type}</h1>
			<p class="w-full whitespace-pre-line">{pack.message}</p>
			<div class="mt-10 flex w-full justify-between gap-3">
				<button
					class="button-primary flex-1"
					onclick={() => decision(true)}
				>
					{pack.accLabel ?? "Confirm"}
				</button>
				<button
					class="button-secondary flex-1"
					onclick={() => decision(false)}
				>
					{pack.refLabel ?? "Cancel"}
				</button>
			</div>
		</div>
	);
}
