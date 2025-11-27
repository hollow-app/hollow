import Tag from "@components/Tag";
import FileCheckIcon from "@assets/icons/files/file-check.svg";
import FilePenIcon from "@assets/icons/files/file-pen.svg";
import FilePlusIcon from "@assets/icons/files/file-plus.svg";
import FolderOpenIcon from "@assets/icons/folder-open.svg";
import FolderCloseIcon from "@assets/icons/folder-close.svg";
import { ICard, ContextMenuItem, TagType } from "@type/hollow";
import { NotebookTabsIcon } from "lucide-solid";
import {
	Accessor,
	createMemo,
	createResource,
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
import { MarkdownManager } from "@managers/MarkdownManager";
import fm from "front-matter";
import FilterButton from "@components/FilterButton";
import WordInput from "@components/WordInput";

const MarkdownEditor = lazy(() => import("@components/MarkdownEditor"));

type NotebookProps = {
	card: ICard;
	noteBook: NotebookType;
};

export default function Notebook({ card, noteBook }: NotebookProps) {
	const [showList, setShowList] = createSignal(false);
	const [isExpand, setExpand] = createSignal(false);
	const [editMode, setEditMode] = createSignal(false);
	const [book, setBook] = createSignal<NotebookType>(noteBook);
	const [note, setNote] = createSignal<NoteType>(
		book().last
			? book().notes.find((i) => i.attributes.title === book().last)
			: null,
	);

	const panel = createMemo(() => {
		// 0: nothing, 1: list, 2: selected
		if (showList()) {
			return 1;
		} else if ((note() || editMode()) && !showList()) {
			return 2;
		} else {
			return 0;
		}
	});
	const [hollowTags, setHollowTags] = createSignal<TagType[]>(
		card.app.getCurrentData("tags"),
	);

	const updateBook = () => {
		NotebookManager.getSelf().setNotebook(book());
	};

	const onNewNote = () => {
		// TODO
		// setBook(prev=>({...prev, last: "new-00-note" }));
		const data: any = fm(book().structure);
		const newNote: NoteType = {
			...data,
			attributes: {
				...data.attributes,
				title: "Note",
				id: crypto.randomUUID(),
			},
			newNote: true,
		};
		setNote(newNote);
		setShowList(false);
		setEditMode(true);
	};

	const onSave = async () => {
		const doesNoteTitleAlreadyExists = book().notes.some(
			(i) => i.attributes.title === note().attributes.title,
		);
		// check if the note is new;
		if (note().newNote) {
			// check if the new note's title doesn't already exists;
			if (!doesNoteTitleAlreadyExists) {
				NotebookManager.getSelf().setNote(
					card.data.extra.name,
					note().attributes.title,
					NotebookManager.getSelf().rebuildMarkdown(note()),
				);
				sendEntry({
					id: note().attributes.id,
					title: note().attributes.title,
					tags: note().attributes.tags.split(","),
					content: note().body,
					// meta: { ...note.dates },
					source: { tool: "notebook", card: card.data.extra.name },
				});
				setEditMode(false);
				setNote((prev) => ({ ...prev, newNote: false }));
				setBook((prev) => ({
					...prev,
					notes: [...prev.notes, note()],
				}));
				updateBook();
			} else {
				card.app.emit("alert", {
					type: "error",
					title: "Notebook",
					message: `Title "${note().attributes.title}" already exists`,
				});
			}
		} else {
			await NotebookManager.getSelf().setNote(
				card.data.extra.name,
				book().last,
				NotebookManager.getSelf().rebuildMarkdown(note()),
				note().attributes.title,
			);
			doesNoteTitleAlreadyExists &&
				setBook((prev) => ({
					...prev,
					notes: prev.notes.map((i) =>
						i.attributes.title === note().attributes.title
							? { ...i, ...note() }
							: i,
					),
				}));
		}
	};
	const sendEntry = (entry: EntryType) => {
		card.app.emit("send-entry", entry);
	};
	const changeBanner = async () => {
		card.app.emit("show-vault", {
			onSelect: async (url: string) => {
				setNote((prev) => ({
					...prev,
					attributes: { ...prev.attributes, banner: url },
				}));
				await NotebookManager.getSelf().setNote(
					card.data.extra.name,
					note().attributes.title,
					NotebookManager.getSelf().rebuildMarkdown(note()),
				);
			},
		});
	};
	const removeNote = (title: string) => {
		if (note().attributes.title === title) {
			setNote(null);
			setEditMode(false);
		}
		setBook((prev: NotebookType) => ({
			...prev,
			last: null,
			notes: prev.notes.filter((i) => i.attributes.title !== title),
		}));
		NotebookManager.getSelf().deleteNote(card.data.extra.name, title);
	};
	//
	const onContextMenu = () => {
		const cmItems: ContextMenuItem = {
			id: `notebook-${card.data.extra.name}`,
			header: "Note",
			items: [
				{
					icon: "Image",
					label: "Change Banner",
					onclick: changeBanner,
				},
				...(note()
					? [
							{
								icon: "Trash2",
								label: "Delete Note",
								onclick: () => {
									removeNote(note().attributes.title);
									card.app.emit(
										"remove-entry",
										note().attributes.id,
									);
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
			card: card.data.extra.name,
			save: updateBook,
			options: [
				{
					type: "text",
					label: "Name",
					description: "Note Book's name",
					value: book().name,
					onAction: (v: string) =>
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

	const changeSelected = async (title: string) => {
		// const content = await NotebookManager.getSelf().getNote(
		// 	card.name,
		// 	title,
		// );
		setNote(book().notes.find((i) => i.attributes.title === title));
		setBook((prev) => ({ ...prev, last: title }));
		setShowList(false);
		updateBook();
	};
	onMount(() => {
		card.toolEvent.on(`${card.id}-settings`, showSettings);
		card.app.on("tags", setHollowTags);
		card.toolEvent.on(`${card.data.extra.name}-remove-entry`, removeNote);
		card.toolEvent.on(`${card.id}-expand`, setExpand);
	});
	onCleanup(() => {
		card.toolEvent.off(`${card.id}-settings`, showSettings);
		card.app.off("tags", setHollowTags);
		card.toolEvent.off(`${card.data.extra.name}-remove-entry`, removeNote);
		card.toolEvent.off(`${card.id}-expand`, setExpand);
	});

	return (
		<div
			class="text-md @container relative flex h-full w-full flex-col items-center"
			classList={{ "text-[1.2em]": isExpand() }}
		>
			{/* Header */}
			<div class="bg-secondary-05 hidden h-10 w-full shrink-0 items-center justify-between gap-4 rounded px-2 @xs:flex @7xl:h-13 @7xl:px-4">
				<h1 class="text-sm font-medium @7xl:text-lg">
					{book().name} <span class="text-secondary-40">Book</span>
				</h1>
				<div class="flex items-center gap-2">
					<Show when={note() || editMode()}>
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
						onclick={() => setShowList((prev: boolean) => !prev)}
						style={{
							"--p": 1,
							"--border-radius": "var(--radius-sm)",
						}}
					>
						<Show
							when={showList()}
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
						class="relative flex min-h-0 w-full flex-1 flex-col"
						oncontextmenu={onContextMenu}
					>
						<div
							class="border-secondary-05 relative bottom-0 mx-auto mt-3 box-border h-30 w-full overflow-hidden rounded-xl border opacity-100 transition-all group-hover:opacity-100 @7xl:h-35"
							style={{
								"background-image": `linear-gradient(to right, var(--secondary-color-05), transparent), url(${note().attributes?.banner})`,
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
									value={note().attributes.title}
									onchange={(e) =>
										setNote((prev) => ({
											...prev,
											attributes: {
												...prev.attributes,
												title: e.currentTarget.value,
											},
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
												words={() =>
													note().attributes?.tags.split(
														",",
													) ?? []
												}
												setWords={(tgs) =>
													setNote((prev) => ({
														...prev,
														attributes: {
															...prev.attributes,
															tags: tgs.join(
																", ",
															),
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
													note().attributes?.tags?.split(
														",",
													) ?? []
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
						<div class="w-full flex-1 shrink-0 justify-center overflow-hidden overflow-y-scroll scroll-smooth">
							<div class="mx-auto flex w-full px-5 @4xl:w-[70%] @7xl:w-[50%]">
								<MarkdownEditor
									editMode={editMode}
									value={() => note().body}
									setValue={(v) => {
										setNote((prev) => ({
											...prev,
											body: v,
										}));
									}}
									uniqueNote={() =>
										`${book().name.toLowerCase()}-${note().attributes.title.toLowerCase()}`
									}
								/>
							</div>
							<Show when={isExpand() && note() && !editMode()}>
								<div class="absolute top-50 left-[80%] opacity-0 @7xl:opacity-100">
									<HeadersTree
										body={() => note().body}
										id={() =>
											`${book().name.toLowerCase()}-${note().attributes.title.toLowerCase()}`
										}
									/>
								</div>
							</Show>
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
					<NoteList
						{...{
							card,
							book,
							changeSelected,
						}}
					/>
				</Show>
			</Presence>
		</div>
	);
}

type NoteListProps = {
	card: ICard;
	book: Accessor<NotebookType>;
	changeSelected: (id: string) => void;
};

function NoteList({ card, book, changeSelected }: NoteListProps) {
	const [selectedGroup, setSelectedGroup] = createSignal<string[]>([]);
	const [searchTerm, setSearchTerm] = createSignal("");
	const [selectedTags, setSelectedTags] = createSignal<string[]>([]);

	const removeGroup = async () => {
		const total = selectedGroup().length;
		const onDone = card.app.emit("alert", {
			type: "loading",
			title: "Notebook",
			message: `Deleting ${total} Note${total > 1 && "s"}...`,
		});
		for (const i of selectedGroup()) {
			await NotebookManager.getSelf().deleteNote(card.data.extra.name, i);
		}
		card.app.emit(
			"remove-entry",
			selectedGroup().map(
				(i) =>
					book().notes.find((j) => j.attributes.title === i)
						.attributes.id,
			),
		);
		onDone();
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
			card.app.emit("context-menu-extend", cm);
		}
	};

	const filteredNotes = createMemo(() => {
		const term = searchTerm().toLowerCase();
		const tags = selectedTags();

		let result = book().notes.filter((note) => {
			const matchesSearch =
				note.attributes.title.toLowerCase().includes(term) ||
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
	const selected = createMemo(() =>
		selectedGroup().includes(note.attributes.title),
	);
	const onSelect = () => {
		setSelectedGroup((prev) =>
			prev.includes(note.attributes.title)
				? prev.filter((i) => i !== note.attributes.title)
				: [...prev, note.attributes.title],
		);
	};
	return (
		<div
			class="group bg-secondary-05 border-primary relative mx-auto flex h-fit w-full cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md"
			onclick={(e) =>
				e.ctrlKey ? onSelect() : changeSelected(note.attributes.title)
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
					{note.attributes.title}
				</h2>
				<span class="truncate" title={note.attributes?.tags}>
					Tags: {note.attributes.tags}
				</span>
			</div>
		</div>
	);
}

function HeadersTree({
	id,
	body,
	floats,
}: {
	id: () => string;
	body: () => string;
	floats?: boolean;
}) {
	const [headers] = createResource(() =>
		MarkdownManager.getSelf().getHeaders(body(), id()),
	);
	return (
		<div class="h-full shrink-0">
			<span class="flex items-center gap-2 pb-3">
				<hr class="bg-secondary-10 size-2 border-0" />
				On this page
			</span>
			<For each={headers()}>
				{(head) => (
					<div class="flex flex-row-reverse items-center justify-end gap-5">
						<a
							href={`#${head.id}`}
							class="peer no-underline-alt text-sm text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
							style={{
								"font-size": "0.8em",
							}}
							classList={{
								"my-1": head.depth - 1 === 0,
							}}
						>
							{head.text}
						</a>
						<Show when={head.depth - 1 > 0}>
							<For each={new Array(head.depth - 1)}>
								{(_, index) => (
									<span
										class="border-secondary-10 h-full border-l py-4"
										classList={{
											"peer-hover:border-primary ":
												index() === 0,
										}}
									/>
								)}
							</For>
						</Show>
					</div>
				)}
			</For>
		</div>
	);
}
