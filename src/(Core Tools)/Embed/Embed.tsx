import { CardType, IStore, ToolApi, ToolOptions } from "@type/hollow";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { EmbedData } from "./EmbedMain";
import { hollow } from "hollow";

type EmbedProps = {
	card: CardType;
	data: EmbedData;
	toolEvents: ToolApi;
	store: IStore;
};
export default function Embed({ toolEvents, card, data, store }: EmbedProps) {
	const [embed, setEmbed] = createSignal(data);

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
					attributes: { placeholder: "<iframe ..." },
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
		<div class="h-full w-full">
			<Show
				when={embed().src}
				fallback={
					<span class="text-secondary-30">
						insert an iframe in this card's settings.
					</span>
				}
			>
				<div innerHTML={embed().src} class="h-full w-full" />
			</Show>
		</div>
	);
}
