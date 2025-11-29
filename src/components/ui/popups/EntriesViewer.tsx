import { TagType } from "@type/hollow";
import ChartPieIcon from "@assets/icons/chart-pie.svg";
import { For, createMemo, createSignal, Show, Suspense } from "solid-js";
import Tag from "../../Tag";
import { ChevronsUpDownIcon, SearchIcon } from "lucide-solid";
import { lazy } from "solid-js";
import { EntryType } from "@type/hollow";
import {
	BookTextIcon,
	ChevronLeftIcon,
	TableOfContentsIcon,
	Trash2Icon,
} from "lucide-solid";
import { Motion, Presence } from "solid-motionone";
import { Accessor, createResource, Setter } from "solid-js";
import { formatDate } from "@managers/manipulation/strings";
import PopupWrapper from "../../ui/PopupWrapper";
import { MarkdownManager } from "@managers/MarkdownManager";
import { EntryManager } from "@managers/EntryManager";
import { hollow } from "hollow";
import FilterButton from "@components/FilterButton";
const Icon = lazy(() => import("@components/Icon"));

type filterType = {
	tools: string[];
	tags: string[];
	text: string;
};
export default function EntriesViewer() {
	const [selected, setSelected] = createSignal(null);

	const [entries, setEntries] = createSignal(EntryManager.getSelf().entries);

	const hollowTags = createMemo(
		() => hollow.events.getData("tags") as TagType[],
	);

	const [filter, setFilter] = createSignal<filterType>({
		tools: [],
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
		const { tags, tools, text } = filter();
		const currentSort = sort();
		const list = entries().filter((entry) => {
			// TODO opt
			const matchesTags =
				tags.length === 0 ||
				entry.tags?.some((tag) => tags.includes(tag));
			const matchesTool =
				tools.length === 0 || tools.includes(entry.source.tool);
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
		<PopupWrapper
			Icon={ChartPieIcon}
			title="Entries Viewer"
			onClose={() => hollow.events.toggle("show-entries")}
		>
			<div class="lvl-1 flex flex-col gap-3">
				<Show
					when={selected()}
					fallback={
						<div class="flex w-full flex-col gap-3 px-3">
							<div class="flex h-fit w-full items-center gap-6">
								<p class="text-secondary-40 px-3 text-sm tracking-wider">
									A unified table that displays entries
									collected from tools across your workspace.
								</p>
								<div class="relative z-1 flex flex-1 items-center gap-3">
									<FilterButton
										options={() => [
											{
												title: "Tools",
												isCheckBox: true,
												items: [
													...new Set(
														entries().map(
															(i) =>
																i.source.tool,
														),
													),
												].map((i) => ({
													label: i,
													checked:
														filter().tools.includes(
															i,
														),
												})),
												onSelect: (v: string[]) =>
													setFilter((prev) => ({
														...prev,
														tools: v,
													})),
											},
											{
												title: "Tags",
												isCheckBox: true,
												items: [
													...new Set(
														entries().flatMap(
															(i) => i.tags,
														),
													),
												].map((i) => ({
													label: i,
													checked:
														filter().tags.includes(
															i,
														),
												})),
												onSelect: (v: string[]) =>
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
												<div class="my-auto flex flex-wrap gap-2 text-[1em]">
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
						</div>
					}
				>
					<EntryViewer
						selected={selected}
						setEntries={setEntries}
						setSelected={setSelected}
						hollowTags={[...hollowTags()]}
					/>
				</Show>
			</div>
		</PopupWrapper>
	);
}

type EntryViewerProps = {
	selected: Accessor<EntryType>;
	setSelected: (v: EntryType) => void;
	hollowTags: TagType[];
	setEntries: Setter<EntryType[]>;
};
function EntryViewer({
	selected,
	setSelected,
	hollowTags,
	setEntries,
}: EntryViewerProps) {
	const [visiRow, setvisiRow] = createSignal(0);
	// const [isEditing, setIsEditing] = createSignal(false);
	const [parsedMd] = createResource(selected().content, () =>
		MarkdownManager.getSelf().renderMarkdown(selected().content, "entry"),
	);
	const removeEntry = () => {
		const id = selected().id;
		hollow.toolManager
			.getToolEvents(selected().source.tool.toLowerCase())
			.emit(`${selected().source.card}-remove-entry`, id);
		setEntries((prev: EntryType[]) => [...prev.filter((i) => i.id !== id)]);
		EntryManager.getSelf().removeEntry(id);
		setSelected(null);
	};
	const editEntry = () => {};

	return (
		<div class="flex min-h-0 w-full flex-1 flex-col gap-2 px-3 pb-3 text-gray-950 dark:text-gray-50">
			<div class="bg-secondary-05 flex w-full items-center rounded-lg px-6 py-3">
				<button
					class="button-control"
					onclick={() => setSelected(null)}
				>
					<ChevronLeftIcon class="m-auto" />
				</button>
				<div class="ml-4 flex h-fit items-center gap-2 rounded-xl p-3">
					<Suspense>
						<Icon
							name={selected().source.icon}
							title={selected().source.tool}
							class="text-secondary-95 my-auto h-10 w-10"
						/>
					</Suspense>
					<div
						class="flex flex-col gap-1"
						style={{
							"line-height": 1,
						}}
					>
						<h1 class="font-bold">{selected().source.tool}</h1>
						<div class="flex items-end gap-3">
							<span class="bg-secondary-15 text-secondary-60 h-fit rounded px-2 py-0.5 text-sm">
								{selected().id}
							</span>{" "}
							<p class="text-secondary-50 font-mono text-xs">
								{formatDate(selected().createdAt)}
							</p>
						</div>
					</div>
				</div>
				<div
					class="ml-auto flex h-fit gap-3"
					style={{
						"line-height": 1,
					}}
				>
					{/* <button
                                                class="button-control flex items-center gap-2 font-medium p-2"
                                                onclick={editEntry}
                                        >
                                                <Show
                                                        when={isEditing}
                                                        fallback={<FilePenIcon class="m-auto" />}
                                                >
                                                        <FileCheckIcon class="m-auto" />
                                                        <span>Save</span>
                                                </Show>
                                        </button> */}
					<button
						class="text-secondary-80 group hover:text-secondary-95 h-8 w-8 rounded-sm hover:bg-red-700/15 active:scale-95"
						onclick={removeEntry}
					>
						<Trash2Icon class="text-secondary-70 h-8 w-8 scale-80 p-1 group-hover:text-red-700" />
					</button>
				</div>
			</div>

			<div class="flex min-h-0 flex-1 flex-col gap-6 px-0 pt-3">
				<div class="flex flex-wrap gap-2 text-[0.65em]">
					<For each={selected().tags}>
						{(tag) => {
							const target = () =>
								hollowTags.find((i) => i.name === tag);
							return (
								<Tag
									tag={() => tag}
									background={() =>
										target()?.background ??
										"var(--color-secondary-95)"
									}
								/>
							);
						}}
					</For>
				</div>

				<div class="bg-secondary-5/50 flex min-h-0 flex-1 flex-col gap-4 rounded-xl p-0">
					<div class="bg-secondary-5 flex justify-center gap-2 rounded-lg p-1">
						<button
							class={`hover:border-secondary-10 flex items-center gap-2 rounded-md border-2 border-dashed border-transparent px-4 py-2 transition-all ${
								visiRow() === 0
									? "bg-secondary-10 text-secondary-90"
									: "text-secondary-60"
							}`}
							onclick={() => setvisiRow(0)}
						>
							<BookTextIcon class="h-5 w-5" />
							<span class="font-medium tracking-wider uppercase">
								Content
							</span>
						</button>

						<button
							class={`hover:border-secondary-10 flex items-center gap-2 rounded-md border-2 border-dashed border-transparent px-4 py-2 transition-all ${
								visiRow() === 1
									? "bg-secondary-10 text-secondary-90"
									: "text-secondary-60"
							}`}
							onclick={() => setvisiRow(1)}
						>
							<TableOfContentsIcon class="h-5 w-5" />
							<span class="font-medium tracking-wider uppercase">
								Details
							</span>
						</button>
					</div>
					<Presence exitBeforeEnter>
						<Show when={visiRow() === 0}>
							<Motion.div
								initial={{
									opacity: 0,
									height: 0,
									scale: 0.95,
								}}
								animate={{
									opacity: 1,
									height: "auto",
									scale: 1,
								}}
								exit={{
									opacity: 0,
									height: 0,
									scale: 0.95,
								}}
								transition={{
									duration: 0.2,
								}}
								class="flex min-h-0 flex-1 origin-top flex-col overflow-hidden"
							>
								<div class="bg-secondary-05 min-h-0 w-full flex-1 overflow-hidden rounded-xl p-6 shadow-inner">
									<Suspense
										fallback={
											<div class="flex h-full w-full items-center justify-center p-8">
												<div class="chaotic-orbit" />
											</div>
										}
									>
										<div
											class="markdown-preview prose dark:prose-invert h-full max-w-none overflow-y-auto"
											innerHTML={parsedMd()}
										/>
									</Suspense>
								</div>
							</Motion.div>
						</Show>

						<Show when={visiRow() === 1}>
							<Motion.div
								initial={{
									opacity: 0,
									height: 0,
									scale: 0.95,
								}}
								animate={{
									opacity: 1,
									height: "auto",
									scale: 1,
								}}
								exit={{
									opacity: 0,
									height: 0,
									scale: 0.95,
								}}
								transition={{
									duration: 0.2,
								}}
								class="flex origin-top flex-col gap-4"
							>
								<div class="bg-secondary-10/50 flex-1 overflow-y-auto rounded-xl p-6 shadow-inner">
									<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
										<For
											each={Object.entries(
												selected().meta,
											)}
										>
											{([key, value]) => (
												<div class="bg-secondary-05 flex items-center gap-3 rounded-lg p-3 text-sm">
													<span class="text-secondary-500 text-secondary-40 font-medium capitalize">
														{key}:
													</span>
													<span
														class="text-secondary-70 truncate"
														title={`${value}`}
													>
														{`${value}`}
													</span>
												</div>
											)}
										</For>
									</div>
								</div>
							</Motion.div>
						</Show>
					</Presence>
				</div>
			</div>
		</div>
	);
}
