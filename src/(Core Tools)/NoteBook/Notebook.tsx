import Tag from "@components/Tag";
import FileCheckIcon from "@assets/icons/files/file-check.svg";
import FilePenIcon from "@assets/icons/files/file-pen.svg";
import FilePlusIcon from "@assets/icons/files/file-plus.svg";
import FileDescriptionIcon from "@assets/icons/files/file-description.svg";
import FolderOpenIcon from "@assets/icons/folder-open.svg";
import FolderCloseIcon from "@assets/icons/folder-close.svg";
import { HollowEvent, ICard, ContextMenuItem, TagType } from "@type/hollow";
import { NotebookTabsIcon } from "lucide-solid";
import fm from "front-matter";
import {
	Accessor,
	createMemo,
	createSignal,
	For,
	lazy,
	onCleanup,
	onMount,
	Setter,
	Show,
} from "solid-js";
import { ToolOptions } from "@type/hollow";
import TextareaAutosize from "solid-textarea-autosize";
import { Motion, Presence } from "solid-motionone";
import { NotebookType } from "./NotebookType";
import { EntryType } from "@type/hollow";
import { NoteType } from "./NoteType";
import { NotebookManager } from "./NotebookManager";
import { timeDifference } from "@managers/manipulation/strings";
import FilterButton from "@components/FilterButton";

const MarkdownEditor = lazy(() => import("@components/MarkdownEditor"));
const WordInput = lazy(() => import("@components/WordInput"));

type NotebookProps = {
	card: ICard;
	noteBook: NotebookType;
};
export default function Notebook({ card, noteBook }: NotebookProps) {
	const [expand, setExpand] = createSignal(false);
	const [editMode, setEditMode] = createSignal(false);
	const [book, setBook] = createSignal<NotebookType>(noteBook);
	const [selected, setSelected] = createSignal<NoteType>(
		noteBook.last
			? noteBook.notes.find((i) => i.id === noteBook.last)
			: null,
	);

	const panel = createMemo(() => {
		// 0: nothing, 1: list, 2: selected
		if (expand()) {
			return 1;
		} else if ((selected() || editMode()) && !expand()) {
			return 2;
		} else {
			return 0;
		}
	});
	const [hollowTags, setHollowTags] = createSignal<TagType[]>(
		card.app.getCurrentData("tags"),
	);

	const updateBook = () => {
		NotebookManager.getSelf().updateNotebook({ ...book(), notes: null });
	};

	const onNewNote = () => {
		const note: NoteType = {
			notebookId: card.id,
			id: crypto.randomUUID(),
			title: "",
			body: book().structure,
			dates: {
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			frontmatter: "tags:",
		};
		setSelected(note);
		setExpand(false);
		setEditMode(true);
	};

	const onSave = () => {
		const note: NoteType = {
			...selected(),
			dates: { ...selected().dates, updatedAt: new Date().toISOString() },
		};
		if (note.title) {
			const trgt = book().notes.findIndex((i) => i.id === note.id);
			setBook((prev: NotebookType) => ({
				...prev,
				last: note.id,
				notes:
					trgt !== -1
						? prev.notes.map((i, idx) =>
								idx === trgt ? { ...note } : i,
							)
						: [...prev.notes, note],
			}));
			NotebookManager.getSelf().updateNote(note);
			updateBook();
			sendEntry({
				id: note.id,
				title: note.title,
				tags: note.attributes.tags,
				content: note.body,
				meta: { ...note.dates },
				source: { tool: "notebook", card: card.name },
			});
			setEditMode(false);
		}
	};
	const sendEntry = (entry: EntryType) => {
		card.app.emit("send-entry", entry);
	};
	const removeEntry = (id: string) => {
		card.app.emit("remove-entry", id);
	};
	const changeBanner = async () => {
		card.app.emit("show-vault", {
			onSelect: (url: string) => {
				setBook((prev) => ({
					...prev,
					notes: prev.notes.map((i) =>
						i.id === selected().id
							? {
									...i,
									attributes: {
										...i.attributes,
										banner: url,
									},
								}
							: i,
					),
				}));
				setSelected((prev) => ({ ...prev, banner: url }));
				NotebookManager.getSelf().updateNote(selected());
			},
		});
	};
	const removeNote = (id: string) => {
		if (selected().id === id) {
			setSelected(null);
			setEditMode(false);
		}
		setBook((prev: NotebookType) => ({
			...prev,
			last: null,
			notes: prev.notes.filter((i) => i.id !== id),
		}));
		NotebookManager.getSelf().deleteNote(id);
	};
	//
	const onContextMenu = () => {
		const cmItems: ContextMenuItem = {
			id: `notebook-${card.name}`,
			header: "Note",
			items: [
				{
					icon: "Image",
					label: "Change Banner",
					onclick: changeBanner,
				},
				...(selected()
					? [
							{
								icon: "Trash2",
								label: "Delete Note",
								onclick: () => {
									removeNote(selected().id);
									removeEntry(selected().id);
								},
							},
						]
					: []),
			],
		};
		card.app.emit("context-menu-extend", cmItems);
	};
	const showSettings = () => {
		const settings: ToolOptions = {
			tool: "NoteBook",
			card: card.name,
			save: updateBook,
			options: [
				{
					type: "text",
					label: "Name",
					description: "Note Book's name",
					value: book().name,
					onChange: (v: string) =>
						setBook((prev) => ({
							...prev,
							name: v,
						})),
				},
				{
					type: "custom",

					render: () => (
						<TextareaAutosize
							class="input"
							style={{
								"--bg-color": "var(--color-secondary-10)",
							}}
							value={book().structure}
							onChange={(e) =>
								setBook((prev) => ({
									...prev,
									structure: e.currentTarget.value,
								}))
							}
						/>
					),
				},
			],
		};
		card.app.emit("tool-settings", settings);
	};

	const changeSelected = (id: string) => {
		setSelected(book().notes.find((i) => i.id === id));
		setBook((prev) => ({ ...prev, last: id }));
		setExpand(false);
		updateBook();
	};
	onMount(() => {
		card.toolEvent.on(`${card.id}-settings`, showSettings);
		card.app.on("tags", setHollowTags);
		card.toolEvent.on(`${card.name}-remove-entry`, removeNote);
	});
	onCleanup(() => {
		card.toolEvent.off(`${card.id}-settings`, showSettings);
		card.app.off("tags", setHollowTags);
		card.toolEvent.off(`${card.name}-remove-entry`, removeNote);
	});

	return (
		<div class="@container relative flex h-full w-full flex-col items-center">
			{/* Header */}
			<div class="bg-secondary-05 hidden h-10 w-full shrink-0 items-center justify-between gap-4 rounded px-2 @xs:flex">
				<h1 class="text-sm font-medium">
					{book().name} <span class="text-secondary-40">Book</span>
				</h1>
				<div class="flex gap-2">
					<Show when={selected() || editMode()}>
						<button
							class="button-control"
							onclick={() => {
								editMode() ? onSave() : setEditMode(true);
							}}
							style={{
								"--p": 1,
								"--border-radius": "var(--radius-sm)",
							}}
						>
							<Show
								when={editMode()}
								fallback={<FilePenIcon class="size-5" />}
							>
								<FileCheckIcon class="size-5" />
							</Show>
						</button>
					</Show>
					<button
						class="button-control"
						onclick={onNewNote}
						style={{
							"--p": 1,
							"--border-radius": "var(--radius-sm)",
						}}
					>
						<FilePlusIcon class="size-5" />
					</button>
					<button
						class="button-control"
						onclick={() => setExpand((prev: boolean) => !prev)}
						style={{
							"--p": 1,
							"--border-radius": "var(--radius-sm)",
						}}
					>
						<Show
							when={expand()}
							fallback={<FolderCloseIcon class="size-5" />}
						>
							<FolderOpenIcon class="size-5" />
						</Show>
					</button>
				</div>
			</div>
			{/* Body */}
			<Presence exitBeforeEnter>
				<Show when={panel() === 2}>
					<Motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						class="flex min-h-0 w-full flex-1 flex-col"
						oncontextmenu={onContextMenu}
					>
						<div
							class="border-secondary-05 relative bottom-0 mx-auto mt-3 box-border h-30 w-full overflow-hidden rounded-xl border opacity-100 transition-all group-hover:opacity-100"
							style={{
								"background-image": `linear-gradient(to right, var(--secondary-color-05), transparent), url(${selected().attributes?.banner})`,
								"background-size": "cover",
								"background-position": "center",
								"background-repeat": "no-repeat",
							}}
						>
							<div
								class="flex h-full w-full flex-col gap-2 p-2"
								classList={{
									"bg-secondary": editMode(),
								}}
								style={{
									"line-height": "0",
								}}
							>
								<input
									class="focus:border-secondary-10 w-full max-w-full overflow-hidden rounded border-transparent text-[1.3em] font-medium text-ellipsis whitespace-nowrap text-gray-900 dark:text-gray-50"
									value={selected().title}
									onchange={(e) =>
										setSelected((prev) => ({
											...prev,
											title: e.currentTarget.value,
										}))
									}
									placeholder={"Note Title"}
									classList={{
										"bg-secondary-05 border-1 px-2 py-1":
											editMode(),
									}}
									disabled={!editMode()}
								/>
								<div class="flex min-h-0 w-full flex-1 text-[0.7em]">
									<Show
										when={!editMode()}
										fallback={
											<WordInput
												words={() => selected().tags}
												setWords={(tgs) =>
													setSelected((prev) => ({
														...prev,
														attributes: {
															...prev.attributes,
															tags: tgs,
														},
													}))
												}
											/>
										}
									>
										<div
											class="flex flex-wrap gap-1"
											style={{
												"font-size": "1.1em",
											}}
										>
											<For
												each={
													selected().attributes
														?.tags ?? []
												}
											>
												{(tag) => {
													const target = () =>
														hollowTags().find(
															(i) =>
																i.name === tag,
														);
													return (
														<Tag
															tag={() => tag}
															background={() =>
																target()
																	?.background ??
																"var(--color-secondary-95)"
															}
														/>
													);
												}}
											</For>
										</div>
									</Show>
								</div>
							</div>
						</div>
						<div class="mx-auto flex w-full flex-1 shrink-0 justify-center overflow-hidden overflow-y-scroll @lg:w-[50%]">
							<div class="w-full px-5">
								<MarkdownEditor
									editMode={editMode}
									value={() => selected().body}
									setValue={(v) => {
										setSelected((prev) => ({
											...prev,
											body: v,
										}));
									}}
									uniqueNote={() =>
										`${book().name.toLowerCase()}-${selected().title.toLowerCase()}`
									}
								/>
							</div>
						</div>
					</Motion.div>
				</Show>
				<Show when={panel() === 0}>
					<Motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						class="flex h-full w-full items-center justify-center"
					>
						<NotebookTabsIcon class="text-secondary-10 h-50 w-50" />
					</Motion.div>
				</Show>
				{/* Notes List */}
				<Show when={panel() === 1}>
					<NoteList {...{ app: card.app, book, changeSelected }} />
				</Show>
			</Presence>
		</div>
	);
}

type NoteListProps = {
	app: HollowEvent;
	book: Accessor<NotebookType>;
	changeSelected: (id: string) => void;
};

function NoteList({ app, book, changeSelected }: NoteListProps) {
	const [selectedGroup, setSelectedGroup] = createSignal<string[]>([]);
	const [searchTerm, setSearchTerm] = createSignal("");
	const [selectedTags, setSelectedTags] = createSignal<string[]>([]);
	const [orderBy, setOrderBy] = createSignal("Newest");

	const removeGroup = () => {
		NotebookManager.getSelf().deleteNotesFromNotebook(
			book().id,
			selectedGroup(),
		);
	};

	const onContextMenu = () => {
		if (selectedGroup().length > 0) {
			const cm: ContextMenuItem = {
				id: "notebook-list",
				header: "notebook",
				items: [
					{
						icon: "Trash2",
						label: `Remove (${selectedGroup().length})`,
						onclick: removeGroup,
					},
				],
			};
			app.emit("context-menu-extend", cm);
		}
	};

	const filteredNotes = createMemo(() => {
		const term = searchTerm().toLowerCase();
		const tags = selectedTags();

		let result = book().notes.filter((note) => {
			const matchesSearch =
				note.title.toLowerCase().includes(term) ||
				note.body.toLowerCase().includes(term);

			const matchesTags =
				tags.length === 0 ||
				tags.every((tag) => note.attributes.tags.includes(tag));

			return matchesSearch && matchesTags;
		});

		switch (orderBy()) {
			case "Oldest":
				result = [...result].sort(
					(a, b) =>
						new Date(a.dates.createdAt).getTime() -
						new Date(b.dates.createdAt).getTime(),
				);
				break;
			case "Title (A–Z)":
				result = [...result].sort((a, b) =>
					a.title.localeCompare(b.title),
				);
				break;
			default:
				result = [...result].sort(
					(a, b) =>
						new Date(b.dates.createdAt).getTime() -
						new Date(a.dates.createdAt).getTime(),
				);
				break;
		}

		return result;
	});

	return (
		<Motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			oncontextmenu={onContextMenu}
			class="bg-secondary flex h-full w-full flex-col justify-center gap-2 px-0 pt-2 pb-5"
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
							title: "Order by",
							value: orderBy,
							items: [
								{ label: "Newest" },
								{ label: "Oldest" },
								{ label: "Title (A–Z)" },
							],
							onSelect: (selected: string) =>
								setOrderBy(selected),
						},
						{
							isCheckBox: true,
							title: "Tags",
							items: [
								...new Set(
									book().notes.flatMap(
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

			<div class="grid w-full flex-1 grid-cols-1 gap-2 @lg:grid-cols-2 @4xl:grid-cols-3">
				<For each={filteredNotes()}>
					{(note) => (
						<NotePreview
							{...{
								note,
								changeSelected,
								setSelectedGroup,
								selectedGroup,
							}}
						/>
					)}
				</For>

				<Show when={filteredNotes().length === 0}>
					<p class="mt-4 text-center text-sm opacity-60">
						No notes found.
					</p>
				</Show>
			</div>
		</Motion.div>
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
	const selected = createMemo(() => selectedGroup().includes(note.id));
	const onSelect = () => {
		setSelectedGroup((prev) =>
			prev.includes(note.id)
				? prev.filter((i) => i !== note.id)
				: [...prev, note.id],
		);
	};
	return (
		<div
			class="group bg-secondary-05 border-primary relative mx-auto flex h-fit w-full cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md"
			onclick={(e) => (e.ctrlKey ? onSelect() : changeSelected(note.id))}
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
				<span
					class="truncate"
					title={(note.attributes?.tags ?? []).join(", ")}
				>
					Tags: {note.attributes.tags}
				</span>
				<span class="truncate">
					Created: {timeDifference(note.dates.createdAt)}
				</span>
			</div>
		</div>
	);
}
