import Sidepanel from "@components/animations/Sidepanel";
import Card from "@components/Card";
import DropDown from "@components/DropDown";
import FilterButton from "@components/FilterButton";
import { FileAdd } from "@coolicons-dev/solid";
import { HollowManager } from "@managers/HollowManager";
import { CardInfo } from "@type/CardInfo";
import { FormType } from "@type/FormType";
import { SearchIcon } from "lucide-solid";
import { Accessor, createMemo, createSignal, For } from "solid-js";
import { lazy } from "solid-js";

const Icon = lazy(() => import("@components/Icon"));

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
	const [hand, setHand] = createSignal(window.toolManager.hand);
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
			.flatMap((i) => i.cards)
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
			window.toolManager.addCard(
				data.name,
				data.tool.toLowerCase(),
				data.emoji,
			);
			setHand([...window.toolManager.hand]);
		};
		const form: FormType = {
			id: "add_new_card",
			title: "New Card",
			options: [
				{
					type: "dropdown",
					label: "Tool",
					key: "tool",
					description: "The tool that will be inside this card",
					options: hand().map((i) => i.title),
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
					description: "Give this card an emoji",
					key: "emoji",
				},
			],
			submit: onSave,
		};

		window.hollowManager.emit("form", form);
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
		<Sidepanel isVisible={isVisible}>
			<div class="border-secondary-10 flex h-full flex-col gap-3 border-l py-5">
				<h1 class="pl-5 text-2xl">Tools</h1>
				<div class="mt-10 grid h-fit w-[calc(calc(var(--spacing)*104)-40)] shrink-0 grid-cols-8 flex-wrap gap-2 px-5">
					<For each={hand()}>
						{(h) => (
							<button
								class="tool-tip flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
								onclick={() => selectTool(h.name)}
								classList={{
									"bg-primary/20 text-primary":
										filter().tools.includes(h.name),
									"bg-secondary-10/80 text-secondary-30":
										!filter().tools.includes(h.name),
								}}
							>
								<Icon class="size-4" name={h.icon} />
								<span class="tool-tip-content" data-side="top">
									{h.title}
								</span>
							</button>
						)}
					</For>
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
					<FilterButton
						configs={[
							{
								type: "multioption",
								label: "State",
								id: "state",
								options: ["favourite", "placed", "unplaced"],
								initials: [1, 2],
								onChange: (v) => {
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
						<FileAdd class="size-5 -rotate-90" />
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
							{(c: CardInfo & { tool: string }) => (
								<Card myCard={c} setHand={setHand} />
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
