import { EntryData } from "@type/EntryData";
import { TagType } from "@type/TagType";
import { For, createMemo, createSignal, Show, Suspense } from "solid-js";
import Tag from "./Tag";
import { ChevronsUpDownIcon, SearchIcon } from "lucide-solid";
import FilterButton from "./FilterButton";
import { Motion, Presence } from "solid-motionone";
import EntryViewer from "./EntryViewer";
import { lazy } from "solid-js";
const Icon = lazy(() => import("@components/Icon"));

type filterType = {
	tool: string;
	tags: string[];
	text: string;
};
export default function EntriesViewer() {
	const [selected, setSelected] = createSignal(null);

	const [entries, setEntries] = createSignal(window.entryManager.entries);

	const hollowTags = createMemo(
		() => window.hollowManager.getCurrentData("tags") as TagType[],
	);

	const [filter, setFilter] = createSignal<filterType>({
		tool: null,
		tags: [],
		text: null,
	});
	const [sort, setSort] = createSignal({
		source: false,
		title: false,
		tags: false,
		content: false,
	});
	const filteredList = createMemo(() => {
		const { tags, tool, text } = filter();
		const currentSort = sort();
		const list = entries().filter((entry) => {
			// TODO opt
			const matchesTags =
				tags.length === 0 ||
				entry.tags?.some((tag) => tags.includes(tag));
			const matchesTool = !tool || entry.source.tool === tool;
			const matchesText =
				!text ||
				entry.title?.includes(text) ||
				entry.content?.includes(text);
			return matchesTags && matchesTool && matchesText;
		});

		const sortKey = Object.entries(currentSort).find(([_, v]) => v)?.[0];

		if (!sortKey) return list;

		return [...list].sort((a, b) => {
			switch (sortKey) {
				case "source":
					return a.source.tool.localeCompare(b.source.tool);
				case "title":
					return a.title?.localeCompare(b.title) ?? 0;
				case "content":
					return a.content?.localeCompare(b.content) ?? 0;
				case "tags":
					return (b.tags?.length ?? 0) - (a.tags?.length ?? 0);
				default:
					return 0;
			}
		});
	});

	return (
		<div class="pop-up">
			<div class="up-pop lvl-1 bg-secondary pointer-events-auto absolute flex flex-col items-center gap-0 rounded-xl p-6 text-xl">
				<Presence exitBeforeEnter>
					<Show when={!selected()}>
						<Motion
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4 }}
							class="w-full"
						>
							<div class="mb-8 flex h-24 w-full items-center gap-6">
								<div class="flex w-[65%] flex-col justify-center rounded-lg">
									<h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
										Entries Viewer
									</h1>
									<p class="mt-1 text-sm font-medium text-neutral-500">
										A unified table that displays entries
										collected from tools across your
										workspace.
									</p>
								</div>
								<div class="relative z-1 flex flex-1 items-center gap-3">
									<FilterButton
										configs={[
											{
												id: "tool",
												type: "dropdown",
												label: "Tool",
												options: [
													...new Set(
														entries().map(
															(i) =>
																i.source.tool,
														),
													),
												],
												onSelect: (v) =>
													setFilter((prev) => ({
														...prev,
														tool: v,
													})),
											},
											{
												id: "tags",
												type: "multioption",
												label: "Tags",
												options: [
													...new Set(
														entries()
															.map((i) => i.tags)
															.flat(),
													),
												],
												onChange: (v) =>
													setFilter((prev) => ({
														...prev,
														tags: v,
													})),
											},
										]}
									/>
									<div class="relative flex-1">
										<input
											class="input peer focus:bg-secondary-10 h-fit w-full text-sm transition-all duration-200"
											value={filter().text}
											style={{
												"--border-w": "0px",
												"--padding-y":
													"calc(var(--spacing) * 3.5)",
												"--padding-x":
													"calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
												"--bg-color-f":
													"var(--secondary-color-15)",
											}}
											placeholder="Search entries..."
											oninput={(e) =>
												setFilter((prev) => ({
													...prev,
													text: e.currentTarget.value,
												}))
											}
										/>
										<SearchIcon class="text-secondary-30 peer-focus:text-secondary-90 absolute top-1/2 left-3 w-5 -translate-y-1/2 transition-colors" />
									</div>
								</div>
							</div>
							<div class="bg-secondary-10/30 text-secondary-45 grid w-full grid-cols-4 grid-rows-1 gap-4 rounded-lg p-6 font-bold backdrop-blur-sm">
								<div class="flex items-center gap-2">
									<h1 class="text-sm tracking-wider uppercase">
										Source
									</h1>
									<ChevronsUpDownIcon
										onclick={() =>
											setSort((prev) => ({
												...prev,
												source: !prev.source,
											}))
										}
										class="size-4 cursor-pointer opacity-60 transition-all hover:scale-110 hover:opacity-100"
									/>
								</div>
								<div class="flex items-center gap-2">
									<h1 class="text-sm tracking-wider uppercase">
										Title
									</h1>
									<ChevronsUpDownIcon
										onclick={() =>
											setSort((prev) => ({
												...prev,
												title: !prev.title,
											}))
										}
										class="size-4 cursor-pointer opacity-60 transition-all hover:scale-110 hover:opacity-100"
									/>
								</div>
								<div class="flex items-center gap-2">
									<h1 class="text-sm tracking-wider uppercase">
										Tags
									</h1>
									<ChevronsUpDownIcon
										onclick={() =>
											setSort((prev) => ({
												...prev,
												tags: !prev.tags,
											}))
										}
										class="size-4 cursor-pointer opacity-60 transition-all hover:scale-110 hover:opacity-100"
									/>
								</div>
								<div class="flex items-center gap-2">
									<h1 class="text-sm tracking-wider uppercase">
										Content
									</h1>
									<ChevronsUpDownIcon
										onclick={() =>
											setSort((prev) => ({
												...prev,
												content: !prev.content,
											}))
										}
										class="size-4 cursor-pointer opacity-60 transition-all hover:scale-110 hover:opacity-100"
									/>
								</div>
							</div>
							<div class="mt-2 flex w-full flex-col gap-2 overflow-hidden overflow-y-scroll text-[0.8em]">
								<For each={filteredList()}>
									{(entry) => (
										<>
											<div
												class="hover:bg-secondary-10/50 group grid cursor-pointer grid-cols-4 grid-rows-1 items-center gap-4 rounded-lg p-4 text-neutral-500 transition-all duration-200"
												onclick={() =>
													setSelected(entry)
												}
											>
												<div class="flex items-center gap-3">
													<Suspense>
														{" "}
														<Icon
															name={
																entry.source
																	.icon
															}
															title={
																entry.source
																	.tool
															}
															class="text-secondary-95 bg-secondary-10/80 group-hover:bg-secondary-10 size-10 rounded-lg p-2 transition-colors"
														/>
													</Suspense>
													<span class="font-medium">
														{entry.source.card}
													</span>
												</div>
												<p
													class="truncate font-medium"
													title={entry.title}
												>
													{entry.title ?? "---"}
												</p>
												<div class="my-auto flex gap-2 text-[0.7em]">
													<For
														each={entry.tags.slice(
															0,
															3,
														)}
													>
														{(tag, index) => {
															const target = () =>
																(
																	hollowTags() as TagType[]
																).find(
																	(i) =>
																		i.name ===
																		tag,
																);
															return (
																<>
																	<Tag
																		tag={() =>
																			tag
																		}
																		background={() =>
																			target()
																				?.background ??
																			"var(--color-secondary-95)"
																		}
																		foreground={() =>
																			target()
																				?.foreground ??
																			"var(--color-secondary)"
																		}
																	/>
																</>
															);
														}}
													</For>
													{entry.tags.length > 3 && (
														<Tag
															tag={() =>
																`+ ${entry.tags.length - 3}`
															}
															background={() =>
																"var(--color-secondary-20)"
															}
															foreground={() =>
																"var(--color-secondary-80)"
															}
															title={entry.tags
																.slice(3)
																.join(", ")}
														/>
													)}
												</div>
												<p
													class="truncate text-neutral-600 dark:text-neutral-400"
													title={entry.content}
												>
													{entry.content ?? "---"}
												</p>
											</div>
											<hr class="border-secondary-15/50 w-full border-dashed" />
										</>
									)}
								</For>
							</div>
						</Motion>
					</Show>
					<Show when={selected()}>
						<EntryViewer
							selected={selected}
							setEntries={setEntries}
							setSelected={setSelected}
							hollowTags={[...hollowTags()]}
						/>
					</Show>
				</Presence>
			</div>
		</div>
	);
}
