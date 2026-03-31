import { CardType, ContextMenuItem } from "@app/type/hollow";
import { Accessor, createMemo, createSignal, For, Setter } from "solid-js";
import { NotebookType } from "../NotebookType";
import { NotebookManager } from "../NotebookManager";
import FilterButton from "@app/components/ui/FilterButton";
import { Show } from "solid-js";
import { NoteType } from "../NoteType";
import { hollow } from "../../../../hollow";
import { MyIconFun } from "@app/components/ui/MyIcon";
import { SearchIcon } from "lucide-solid";
import { Checkbox, Input } from "@ui";
import { EventEmitterSource } from "@app/utils/manipulation/strings";

type NoteListProps = {
	card: CardType;
	book: NotebookType;
	changeSelected: (id: string) => void;
	isExpand?: Accessor<boolean>;
};

export default function NoteList(props: NoteListProps) {
	const [selectedGroup, setSelectedGroup] = createSignal<string[]>([]);
	const [searchTerm, setSearchTerm] = createSignal("");
	const [selectedTags, setSelectedTags] = createSignal<string[]>([]);
	const filter = createMemo(() =>
		props.book.notes
			.flatMap((note) =>
				(note.attributes.tags ?? "")
					.split(",")
					.map((tag) => tag.trim())
					.filter((tag) => tag),
			)
			.filter((tag, index, arr) => arr.indexOf(tag) === index)
			.map((tag) => ({
				label: tag,
				checked: selectedTags().includes(tag),
			})),
	);

	const removeGroup = async () => {
		const total = selectedGroup().length;
		const result = hollow.events.emit("alert", {
			type: "loading",
			title: "Notebook",
			message: `Deleting ${total} Note${total > 1 && "s"}...`,
		});
		const onDone = EventEmitterSource("source", result);
		try {
			for (const i of selectedGroup()) {
				await NotebookManager.getSelf().deleteNote(
					props.card.data.name,
					i,
				);
			}
			if (onDone) {
				onDone["callback"]({
					type: "success",
					title: "Deletion Complete",
				});
			}
		} catch (e) {
			onDone["callback"]({
				title: "Oops!",
				type: "error",
				message: "Something went wrong. Please try again.",
			});
		}
	};

	const onContextMenu = () => {
		if (selectedGroup().length > 0) {
			const cm: ContextMenuItem = {
				id: "notebook-list",
				header: "notebook",
				items: [
					{
						icon: MyIconFun({ name: "trash" }),
						label: `Remove (${selectedGroup().length})`,
						onclick: removeGroup,
					},
				],
			};
			hollow.events.emit("context-menu-extend", cm);
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
			class="flex h-full w-full flex-col justify-center"
			classList={{
				// "border-l border-secondary-10 pl-2 py-5": props.isExpand,
				"pt-2 px-0 pb-5 gap-2": !props.isExpand(),
				"px-3 py-5 gap-4": props.isExpand(),
			}}
			oncontextmenu={onContextMenu}
		>
			<Show when={props.isExpand()}>
				<div class="space-y-1">
					<h2 class="text-lg font-semibold tracking-tight">Notes</h2>
					<p class="text-sm text-neutral-500">Manage your Notes.</p>
				</div>
			</Show>
			<div class="flex gap-1">
				<Input
					icon="search"
					value={searchTerm()}
					oninput={(e) => setSearchTerm(e.currentTarget.value)}
					placeholder="Search"
					class="w-full"
				/>
				<FilterButton
					options={() => [
						{
							isCheckBox: true,
							title: "Tags",
							items: filter(),
							onSelect: (tags: string[]) => setSelectedTags(tags),
						},
					]}
				/>
			</div>

			<div class="grid w-full flex-1 auto-rows-min grid-cols-1 gap-2 @lg:grid-cols-2 @4xl:grid-cols-3">
				<For each={filteredNotes()}>
					{(note, index) => (
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
			class="group border-primary relative mx-auto flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md"
			onclick={(e) =>
				e.ctrlKey ? onSelect() : changeSelected(note.title)
			}
			classList={{
				"border-secondary-15 ": !selected(),
			}}
		>
			<div
				class="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
				classList={{ "opacity-100": selected() }}
				onclick={(e) => e.stopPropagation()}
			>
				<Checkbox checked={selected()} onclick={onSelect} />
			</div>

			<div
				class="border-secondary-05 flex h-full flex-col gap-1 rounded-lg p-2 px-3 text-xs text-neutral-500"
				style={{
					"background-size": "cover",
					"background-position": "center",
					"background-repeat": "no-repeat",
					...(note.attributes.banner && {
						"background-image": `linear-gradient(to right, var(--secondary-color), transparent), url(${note.attributes.banner})`,
					}),
				}}
			>
				<h2 class="truncate text-lg font-medium text-neutral-800 dark:text-neutral-200">
					{note.title}
				</h2>
				<Show when={note.attributes.tags}>
					<span class="truncate" title={note.attributes?.tags}>
						Tags: {note.attributes.tags}
					</span>
				</Show>
			</div>
		</div>
	);
}
