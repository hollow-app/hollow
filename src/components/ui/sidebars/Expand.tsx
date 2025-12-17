import CardConfig from "@components/CardConfig";
import { FormType, CardType } from "@type/hollow";
import { PlusIcon, SearchIcon } from "lucide-solid";
import { Accessor, createMemo, createSignal, For } from "solid-js";
import { hollow } from "hollow";
import FilterButton from "@components/FilterButton";
import Segmented from "@components/dynamic/Segmented";
import Form from "../popups/Form";

type FilterType = {
	tools: string[];
	favourite: boolean;
	placed: boolean;
	unplaced: boolean;
};

export default function Expand() {
	// TODO 11
	const hand = hollow.toolManager.getHand();
	const icons = createMemo(() =>
		hand.reduce((a, i) => {
			a[i.name] = i.icon;
			return a;
		}),
	);
	const [filter, setFilter] = createSignal<FilterType>({
		tools: [],
		favourite: false,
		placed: true,
		unplaced: true,
	});
	const cards = createMemo(() =>
		hollow
			.cards()
			.filter(
				(i) =>
					filter().tools.length === 0 ||
					filter().tools.includes(i.data.tool),
			)
			.filter((card) => {
				const f = filter();
				if (f.favourite && !card.data.isFavored) return false;
				if (!f.placed && card.data.isPlaced) return false;
				if (!f.unplaced && !card.data.isPlaced) return false;
				return true;
			}),
	);

	const addNewCard = () => {
		const onSave = (data: any) => {
			hollow.toolManager.addCard(
				data.name,
				data.tool.toLowerCase(),
				data.emoji,
			);
			// setHand([...hollow.toolManager.getHand()]);
		};
		const form: FormType = {
			id: crypto.randomUUID(),
			title: "Create Card",
			options: [
				{
					type: "dropdown",
					label: "Tool",
					key: "tool",
					inline: true,
					description: "The tool that will be inside this card",
					placeholder: "Tool",
					// TODO multi select in dropdown yet one for FORM
					options: [
						{
							items: hand.map((i) => i.name),
						},
					],
				},
				{
					type: "text",
					key: "name",
					inline: true,
					label: "Card Name",
					attributes: {
						pattern: "^[A-Za-z]+$",
						placeholder: "Card name (e.g., ToDo)",
						title: "Only letters (A-Z, a-z) are allowed",
					},
				},
				{
					type: "emoji",
					label: "Emoji",
					value: "☂️",
					row: true,
					description: "Give this card an emoji",
					key: "emoji",
				},
			],
			submit: onSave,
		};

		hollow.events.emit("form", form);
	};
	const selectTool = (tools: string[]) => {
		setFilter((prev) => ({
			...prev,
			tools,
		}));
	};

	return (
		<div class="my-2 size-full rounded-xl">
			<div class="flex h-full flex-col gap-3 px-3 py-3">
				<div class="flex items-center gap-3">
					<div class="relative flex-1">
						<input
							class="input peer ml-auto h-fit max-w-full transition-all duration-200"
							style={{
								"--padding-x":
									"calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
							}}
							onInput={(e) =>
								setFilter((prev) => ({
									...prev,
									search: e.currentTarget.value,
								}))
							}
							placeholder="Search"
						/>
						<SearchIcon class="text-secondary-30 peer-focus:text-secondary-50 absolute top-1/2 left-3 size-5 -translate-y-1/2 transition-colors" />
					</div>
					<FilterButton
						options={() => [
							{
								title: "status",
								isCheckBox: true,
								items: [
									{
										label: "favourite",
										checked: filter().favourite,
									},
									{
										label: "placed",
										checked: filter().placed,
									},
									{
										label: "unplaced",
										checked: filter().unplaced,
									},
								],
								onSelect: (v) => {
									const tmp = Object.fromEntries(
										["favourite", "placed", "unplaced"].map(
											(key) => [key, v.includes(key)],
										),
									);
									setFilter((prev) => ({ ...prev, ...tmp }));
								},
							},
							{
								title: "Tool",
								isCheckBox: true,
								items: hand.map((i) => ({
									label: i.name,
									checked: filter().tools.includes(i.name),
								})),
								onSelect: selectTool,
							},
						]}
					/>
					<button
						class="button-control border-secondary-10 border"
						onclick={addNewCard}
					>
						<PlusIcon class="size-5 -rotate-90" />
					</button>
				</div>

				<div class="w-full flex-1 overflow-hidden">
					<hr
						class="h-px w-full shrink-0 border-0"
						style={{
							background:
								"linear-gradient(to right, transparent , var(--color-secondary-10) 20%, transparent)",
						}}
					/>
					<div class="flex h-[calc(100%-2px)] flex-col gap-1 overflow-hidden overflow-y-auto">
						<For each={cards()}>
							{(c: CardType) => (
								<CardConfig
									myCard={c}
									icon={icons()[c.data.tool]}
								/>
							)}
						</For>
					</div>
					<hr
						class="h-px w-full shrink-0 border-0"
						style={{
							background:
								"linear-gradient(to right, transparent, var(--color-secondary-10), transparent)",
						}}
					/>
				</div>
			</div>
		</div>
	);
}
