import { EntryType } from "@type/hollow";
import {
	BookTextIcon,
	ChevronLeftIcon,
	TableOfContentsIcon,
	Trash2Icon,
} from "lucide-solid";
import { Motion, Presence } from "solid-motionone";
import Tag from "./Tag";
import { TagType } from "@type/hollow";
import {
	Accessor,
	createResource,
	createSignal,
	For,
	Setter,
	Show,
	Suspense,
} from "solid-js";
import { formatDate } from "@managers/manipulation/strings";
import { lazy } from "solid-js";
const Icon = lazy(() => import("@components/Icon"));

type EntryViewerProps = {
	selected: Accessor<EntryType>;
	setSelected: (v: EntryType) => void;
	hollowTags: TagType[];
	setEntries: Setter<EntryType[]>;
};
export default function EntryViewer({
	selected,
	setSelected,
	hollowTags,
	setEntries,
}: EntryViewerProps) {
	const [visiRow, setvisiRow] = createSignal(0);
	const [isEditing, setIsEditing] = createSignal(false);
	const [parsedMd] = createResource(selected().content, () =>
		window.markdownManager.renderMarkdown(selected().content, "entry"),
	);
	const removeEntry = () => {
		const id = selected().id;
		window.toolManager.toolsEvent[
			selected().source.tool.toLowerCase()
		].emit(`${selected().source.card}-remove-entry`, id);
		setEntries((prev: EntryType[]) => [...prev.filter((i) => i.id !== id)]);
		window.entryManager.removeEntry(id);
		setSelected(null);
	};
	const editEntry = () => {};

	return (
		<div class="flex min-h-0 w-full flex-1 flex-col gap-2 pb-4 text-gray-950 dark:text-gray-50">
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
