import { CardType, IStore, ToolApi, ToolOptions } from "@type/hollow";
import {
	createEffect,
	createMemo,
	createSignal,
	on,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { EmbedData } from "./EmbedMain";
import { hollow } from "hollow";
import { em } from "polished";
import { Accessor } from "solid-js";

type EmbedProps = {
	card: CardType;
	data: EmbedData;
	toolEvents: ToolApi;
	store: IStore;
};
export default function Embed({ toolEvents, card, data, store }: EmbedProps) {
	const [embed, setEmbed] = createSignal(data);
	const url = createMemo(() => {
		try {
			return new URL(embed().src);
		} catch (e) {
			return null;
		}
	});

	const setSettingsVisible = () => {
		const ini: ToolOptions = {
			tool: "Embed",
			card: card.data.name,
			save: () => {
				store.set(card.id, embed());
			},
			options: [
				{
					type: "longtext",
					label: "IFrame",
					description: "embed an iframe",
					attributes: { placeholder: "src..." },
					value: embed().src,
					onAction: (s: string) => {
						hollow.events.emit(
							"character-add-achievement",
							"🌐 Portal Opened",
						);
						setEmbed((prev: EmbedData) => ({
							...prev,
							src: s,
						}));
					},
				},
			],
		};
		hollow.events.emit("tool-settings", ini);
	};

	onMount(() => {
		toolEvents.on(`${card.id}-settings`, setSettingsVisible);
	});

	onCleanup(() => {
		toolEvents.off(`${card.id}-settings`, setSettingsVisible);
	});
	return (
		<div class="group relative size-full">
			<Show
				when={embed().src}
				fallback={
					<span class="text-secondary-30 m-auto">
						insert an iframe in this card's settings.
					</span>
				}
			>
				<iframe src={embed().src} width={"100%"} height={"100%"} />
			</Show>
			{/* Panel */}
			<div class="bg-secondary-05 border-secondary-10 absolute top-1 left-1 flex items-center gap-1 rounded border p-1 opacity-0 transition-all group-hover:opacity-100">
				<Show when={url()}>
					<img src={`${url().origin}/favicon.ico`} class="size-4" />
					<p class="text-secondary-50 truncate text-xs">
						{url().hostname}
					</p>
				</Show>
			</div>
		</div>
	);
}
