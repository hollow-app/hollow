import { ContextMenuItem, ICard } from "@type/hollow";
import { Accessor, createMemo, createSignal, For, Setter } from "solid-js";
import { NotebookType } from "../NotebookType";
import { NotebookManager } from "../NotebookManager";
import FilterButton from "@components/FilterButton";
import { Show } from "solid-js";
import { NoteType } from "../NoteType";
import { Trash2Icon } from "lucide-solid";

type NoteListProps = {
	card: ICard;
	book: NotebookType;
	changeSelected: (id: string) => void;
	isExpand?: boolean;
};

export default function NoteList(props: NoteListProps) {
	const [selectedGroup, setSelectedGroup] = createSignal<string[]>([]);
	const [searchTerm, setSearchTerm] = createSignal("");
	const [selectedTags, setSelectedTags] = createSignal<string[]>([]);

	const removeGroup = async () => {
		const total = selectedGroup().length;
		const onDone = props.card.app.emit("alert", {
			type: "loading",
			title: "Notebook",
			message: `Deleting ${total} Note${total > 1 && "s"}...`,
		});
		for (const i of selectedGroup()) {
			await NotebookManager.getSelf().deleteNote(
				props.card.data.extra.name,
				i,
			);
		}
		onDone();
	};

	const onContextMenu = () => {
		if (selectedGroup().length > 0) {
			const cm: ContextMenuItem = {
				id: "notebook-list",
				header: "notebook",
				items: [
					{
						icon: Trash2Icon,
						label: `Remove (${selectedGroup().length})`,
						onclick: removeGroup,
					},
				],
			};
			props.card.app.emit("context-menu-extend", cm);
		}
	};

	const filteredNotes = createMemo(() => {
		const term = searchTerm().toLowerCase();
		const tags = selectedTags();

		let result = props.book.notes.filter((note) => {
			const matchesSearch =
				note.title.toLowerCase().includes(term) ||
				note.body.toLowerCase().includes(term);
			const matchesTags =
				tags.length === 0 ||
				(note.attributes.tags &&
					tags.every((tag) => note.attributes.tags.includes(tag)));

			return matchesSearch && matchesTags;
		});

		return result;
	});

	return (
		<div
			class="bg-secondary flex h-full w-full flex-col justify-center gap-2 px-0 pt-2 pb-5"
			oncontextmenu={onContextMenu}
		>
			<div class="flex gap-1">
				<input
					class="input flex-1 text-sm"
					placeholder="Search"
					value={searchTerm()}
					onInput={(e) => setSearchTerm(e.currentTarget.value)}
					style={{
						"--padding-x": "calc(var(--spacing) * 2)",
						"--padding-y": "calc(var(--spacing) * 1)",
					}}
				/>

				<FilterButton
					options={() => [
						{
							isCheckBox: true,
							title: "Tags",
							items: [
								...new Set(
									props.book.notes.flatMap(
										(i) => i.attributes.tags,
									),
								),
							].map((tag) => ({
								label: tag,
								checked: selectedTags().includes(tag),
							})),
							onSelect: (tags: string[]) => setSelectedTags(tags),
						},
					]}
				/>
			</div>

			<div class="grid w-full flex-1 auto-rows-min grid-cols-1 gap-2 @lg:grid-cols-2 @4xl:grid-cols-3">
				<For each={filteredNotes()}>
					{(note) => (
						<NotePreview
							note={note}
							changeSelected={props.changeSelected}
							setSelectedGroup={setSelectedGroup}
							selectedGroup={selectedGroup}
						/>
					)}
				</For>
				<Show when={filteredNotes().length === 0}>
					<p class="mt-4 text-center text-sm opacity-60">
						No notes found.
					</p>
				</Show>
			</div>
		</div>
	);
}

type NotePreviewProps = {
	note: NoteType;
	changeSelected: (id: string) => void;
	setSelectedGroup: Setter<string[]>;
	selectedGroup: Accessor<string[]>;
};
function NotePreview({
	note,
	changeSelected,
	selectedGroup,
	setSelectedGroup,
}: NotePreviewProps) {
	const selected = createMemo(() => selectedGroup().includes(note.title));
	const onSelect = () => {
		setSelectedGroup((prev) =>
			prev.includes(note.title)
				? prev.filter((i) => i !== note.title)
				: [...prev, note.title],
		);
	};
	return (
		<div
			class="group bg-secondary-05 border-primary relative mx-auto flex h-fit w-full cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md"
			onclick={(e) =>
				e.ctrlKey ? onSelect() : changeSelected(note.title)
			}
			classList={{
				"border-secondary-10 hover:border-secondary-10": !selected(),
			}}
			style={{
				"background-image": `linear-gradient(to right, var(--secondary-color-05), transparent), url(${note.attributes.banner})`,
				"background-size": "cover",
				"background-position": "center",
				"background-repeat": "no-repeat",
			}}
		>
			<input
				type="checkbox"
				class="checkbox top-1 right-1 opacity-0 group-hover:opacity-100"
				classList={{ "opacity-100": selected() }}
				style={{ "--position": "absolute", "--margin": "0" }}
				checked={selected()}
				onclick={(e) => {
					e.stopPropagation();
					onSelect();
				}}
			/>

			<div class="flex flex-col gap-1 p-2 px-3 text-xs text-neutral-500">
				<h2 class="truncate text-lg font-medium text-neutral-800 dark:text-neutral-200">
					{note.title}
				</h2>
				<span class="truncate" title={note.attributes?.tags}>
					Tags: {note.attributes.tags}
				</span>
			</div>
		</div>
	);
}
