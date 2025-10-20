import { DataBase, HollowEvent, ICard, ToolOptions } from "@type/hollow";
import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { EmbedData } from "./EmbedMain";

type EmbedProps = {
	card: ICard;
	data: EmbedData;
	db: DataBase;
	app: HollowEvent;
};
export default function Embed({ card, data, db, app }: EmbedProps) {
	const [embed, setEmbed] = createSignal(data);

	const setSettingsVisible = () => {
		const ini: ToolOptions = {
			tool: "Embed",
			card: card.name,
			save: () => {
				db.putData(card.name, {
					src: embed().src,
				});
			},
			options: [
				{
					type: "longtext",
					label: "IFrame",
					description: "embed an iframe",
					placeholder: "<iframe ...",
					value: embed().src,
					onChange: (s: string) => {
						setEmbed((prev: EmbedData) => ({
							...prev,
							src: s,
						}));
					},
				},
			],
		};
		app.emit("tool-settings", ini);
	};

	onMount(() => {
		app.on(`embed-${card.name}-settings`, setSettingsVisible);
	});

	onCleanup(() => {
		app.off(`embed-${card.name}-settings`, setSettingsVisible);
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
