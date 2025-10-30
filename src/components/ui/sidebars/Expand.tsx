import Sidepanel from "@components/animations/Sidepanel";
import Card from "@components/Card";
import DropDown from "@components/DropDown";
import { FormType, CardType } from "@type/hollow";
import { PlusIcon, SearchIcon } from "lucide-solid";
import { Accessor, createMemo, createSignal, For } from "solid-js";
import { lazy } from "solid-js";
import { hollow } from "hollow";

const IconInner = lazy(() => import("@components/Icon"));

type FilterType = {
	tools: string[];
	favourite: boolean;
	placed: boolean;
	unplaced: boolean;
};

type ExpandProps = {
	isVisible: Accessor<boolean>;
};

export default function Expand({ isVisible }: ExpandProps) {
	const [hand, setHand] = createSignal(hollow.toolManager.getHand());
	const [filter, setFilter] = createSignal<FilterType>({
		tools: [],
		favourite: false,
		placed: true,
		unplaced: true,
	});
	const cards = createMemo(() =>
		hand()
			.filter(
				(i) =>
					filter().tools.length === 0 ||
					filter().tools.includes(i.name),
			)
			.flatMap((i) =>
				i.cards.map((card) => ({
					...card,
					tool: i.name,
					icon: i.icon,
					title: i.title,
				})),
			)
			.filter((card) => {
				const f = filter();

				if (f.favourite && !card.isFavored) return false;
				if (!f.placed && card.isPlaced) return false;
				if (!f.unplaced && !card.isPlaced) return false;

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
			setHand([...hollow.toolManager.getHand()]);
		};
		const form: FormType = {
			id: crypto.randomUUID(),
			title: "New Card",
			options: [
				{
					type: "dropdown",
					label: "Tool",
					key: "tool",
					description: "The tool that will be inside this card",
					// TODO multi select in dropdown yet one for FORM
					options: [
						{
							items: hand().map((i) => ({ label: i.title })),
							onSelect: () => {},
						},
					],
				},
				{
					type: "text",
					key: "name",
					label: "Card Name",
					pattern: "^[A-Za-z]+$",
					placeholder: "Card name (e.g., ToDo)",
				},
				{
					type: "emoji",
					label: "Emoji",
					value: "☂️",
					description: "Give this card an emoji",
					key: "emoji",
				},
			],
			submit: onSave,
		};

		hollow.events.emit("form", form);
	};
	const selectTool = (name: string) => {
		setFilter((prev) => ({
			...prev,
			tools: (() => {
				const index = prev.tools.indexOf(name);
				if (index !== -1) {
					return [...prev.tools.filter((_, i) => i !== index)];
				} else {
					return [...prev.tools, name];
				}
			})(),
		}));
	};

	return (
		<Sidepanel isVisible={isVisible} overflowVisible>
			<div class="border-secondary-10 flex h-full flex-col gap-3 border-l py-5">
				<div class="flex px-5">
					<div class="bg-secondary-05/50 border-secondary-10 flex h-fit w-full gap-2 rounded-lg border p-4">
						<div class="h-fit flex-1">
							<h1 class="text-xl font-medium whitespace-nowrap text-neutral-900 dark:text-neutral-100">
								Tools & Cards
							</h1>
							<div class="flex h-fit w-84 shrink-0 flex-wrap gap-2 pt-2">
								<For each={hand()}>
									{(h) => (
										<button
											class="flex w-fit items-center gap-1 rounded p-1.5 text-sm font-medium transition-colors"
											onclick={() => selectTool(h.name)}
											classList={{
												"bg-primary/20 text-primary":
													filter().tools.includes(
														h.name,
													),
												"bg-secondary-10/80 text-secondary-30":
													!filter().tools.includes(
														h.name,
													),
											}}
										>
											<IconInner
												class="size-4"
												name={h.icon}
											/>
											{h.title}
										</button>
									)}
								</For>
							</div>
						</div>
					</div>
				</div>
				<div class="flex items-center gap-3 px-5">
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
					<DropDown
						isFilter
						style={{ "--w": "fit-content" }}
						options={() => [
							{
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
					<div class="flex h-[calc(100%-2px)] flex-col gap-1 overflow-hidden overflow-y-auto px-5">
						<For each={cards()}>
							{(
								c: CardType & {
									tool: string;
									icon: string;
									title: string;
								},
							) => <Card myCard={c} setHand={setHand} />}
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
		</Sidepanel>
	);
}

const cardsy = [
	{
		name: "Task Planner",
		emoji: "🗓️",
		isPlaced: true,
		isFavored: false,
		tool: "Image",
		CreatedDate: "2025-03-14",
	},
	{
		name: "Note Keeper",
		emoji: "📝",
		isPlaced: false,
		isFavored: true,
		tool: "NotebookTabs",
		CreatedDate: "2025-02-10",
	},
	{
		name: "Music Player",
		emoji: "🎵",
		isPlaced: true,
		isFavored: true,
		tool: "Kanban",
		CreatedDate: "2025-05-22",
	},
	{
		name: "Weather Watch",
		emoji: "🌤️",
		isPlaced: false,
		isFavored: false,
		tool: "CodeXml",
		CreatedDate: "2025-01-05",
	},
	{
		name: "Finance Tracker",
		emoji: "💰",
		isPlaced: true,
		isFavored: false,
		tool: "NotebookTabs",
		CreatedDate: "2025-04-01",
	},
	{
		name: "Habit Builder",
		emoji: "📈",
		isPlaced: false,
		tool: "NotebookTabs",
		isFavored: true,
		CreatedDate: "2025-07-09",
	},
	{
		name: "Photo Gallery",
		emoji: "🖼️",
		tool: "Image",
		isPlaced: true,
		isFavored: false,
		CreatedDate: "2025-06-15",
	},
	{
		name: "Daily Journal",
		emoji: "📔",
		isPlaced: false,
		isFavored: true,
		tool: "NotebookTabs",
		CreatedDate: "2025-03-03",
	},
	{
		name: "Quote Board",
		emoji: "💬",
		isPlaced: true,
		isFavored: true,
		CreatedDate: "2025-08-20",
		tool: "NotebookTabs",
	},
	{
		name: "Focus Timer",
		emoji: "⏳",
		isPlaced: false,
		tool: "NotebookTabs",
		isFavored: false,
		CreatedDate: "2025-09-12",
	},
];
