import CardConfig from "@app/components/ui/CardConfig";
import { FormType, CardType } from "@app/type/hollow";
import { PlusIcon, SearchIcon } from "lucide-solid";
import { Accessor, createMemo, createSignal, For } from "solid-js";
import { hollow } from "../../../../hollow";
import FilterButton from "@app/components/ui/FilterButton";
import { useStore } from "@app/store";
import { getHand } from "@app/managers/Module/effects";
import { Button, Input } from "@ui";
import { form_newInstance } from "@app/utils/common";

type FilterType = {
	tools: string[];
	favourite: boolean;
	placed: boolean;
	unplaced: boolean;
};

export default function Expand() {
	const { state, dispatch } = useStore();
	const hand = () => getHand();
	const [filter, setFilter] = createSignal<FilterType>({
		tools: [],
		favourite: false,
		placed: true,
		unplaced: true,
	});
	const cards = createMemo(() =>
		state.module.instances
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

	const selectTool = (tools: string[]) => {
		setFilter((prev) => ({
			...prev,
			tools,
		}));
	};

	return (
		<div class="my-2 size-full rounded-xl">
			<div class="flex h-full flex-col gap-3 py-3 pr-5 pl-3">
				<div class="border-secondary-10 flex flex-col gap-4 border-b pb-4">
					<div class="space-y-1">
						<h2 class="text-lg font-semibold tracking-tight">
							Instances Manager
						</h2>
						<p class="text-sm text-neutral-500">
							Manage your tools instances.
						</p>
					</div>
					<div class="flex items-center gap-2">
						<Input
							icon="search"
							oninput={(e) => {
								setFilter((prev) => ({
									...prev,
									search: e.currentTarget.value,
								}));
							}}
							placeholder="Search"
						/>
						<FilterButton
							options={() => [
								{
									title: "Status",
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
											[
												"favourite",
												"placed",
												"unplaced",
											].map((key) => [
												key,
												v.includes(key),
											]),
										);
										setFilter((prev) => ({
											...prev,
											...tmp,
										}));
									},
								},
								{
									title: "Tool",
									isCheckBox: true,
									items: Object.entries(hand()).map(
										([_, i]) => ({
											label: i.name,
											checked: filter().tools.includes(
												i.name,
											),
										}),
									),
									onSelect: selectTool,
								},
							]}
						/>
						<Button.Root
							id="new-card-btn"
							class="shrink-0 border"
							variant="ghost"
							onclick={() => form_newInstance(dispatch, hand)}
							icon
						>
							<PlusIcon class="size-5 -rotate-90" />
						</Button.Root>
					</div>
				</div>

				<div class="w-full flex-1 overflow-hidden">
					<div class="flex h-[calc(100%-2px)] flex-col gap-1 overflow-hidden overflow-y-auto">
						<For each={cards()}>
							{(c: CardType, index) => (
								<CardConfig
									myCard={c}
									icon={hand()[c.data.tool]?.icon}
									index={index}
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
