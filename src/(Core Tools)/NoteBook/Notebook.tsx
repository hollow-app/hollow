import Tag from "@components/Tag";
import { TagType } from "@type/TagType";
import { HollowEvent, ICard } from "hollow-api";
import { FolderCheck, FolderEdit, NotebookTabsIcon } from "lucide-solid";
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
import { ContextMenuItem } from "@type/ContextMenuItem";
import { ToolOptions } from "@type/ToolOptions";
import TextareaAutosize from "solid-textarea-autosize";
import { Motion, Presence } from "solid-motionone";
import { EntryData } from "@type/EntryData";
import { NotebookType } from "./NotebookType";
import { NoteType } from "./NoteType";
import { NotebookManager } from "./NotebookManager";
import { FileDocument, FolderAdd, FolderDocument } from "@coolicons-dev/solid";
import { timeDifference } from "@managers/manipulation/strings";

const MarkdownEditor = lazy(() => import("@components/MarkdownEditor"));
const WordInput = lazy(() => import("@components/WordInput"));

type NotebookProps = {
	card: ICard;
	app: HollowEvent;
	noteBook: NotebookType;
	manager: NotebookManager;
};
export default function Notebook({
	card,
	noteBook,
	app,
	manager,
}: NotebookProps) {
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
		app.getCurrentData("tags"),
	);

	const updateBook = () => {
		manager.updateNotebook({ ...book(), notes: null });
	};

	const onNewNote = () => {
		const note: NoteType = {
			notebookId: card.name,
			id: crypto.randomUUID(),
			title: "",
			tags: [],
			content: book().structure,
			dates: {
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		};
		setSelected(note);
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
			manager.updateNote(note);
			updateBook();
			sendEntry({
				id: note.id,
				title: note.title,
				tags: note.tags,
				content: note.content,
				meta: { ...note.dates },
				source: { tool: "notebook", card: card.name },
			});
		}
	};
	const sendEntry = (entry: EntryData) => {
		app.emit("send-entry", entry);
	};
	const removeEntry = (id: string) => {
		app.emit("remove-entry", id);
	};
	const changeBanner = async () => {
		window.hollowManager.emit("show-vault", {
			onSelect: (url: string) => {
				setBook((prev) => ({
					...prev,
					notes: prev.notes.map((i) =>
						i.id === selected().id ? { ...i, banner: url } : i,
					),
				}));
				setSelected((prev) => ({ ...prev, banner: url }));
				manager.updateNote(selected());
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
		manager.deleteNote(id);
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
		app.emit("context-menu-extend", cmItems);
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
		app.emit("tool-settings", settings);
	};

	const changeSelected = (id: string) => {
		setSelected(book().notes.find((i) => i.id === id));
		setBook((prev) => ({ ...prev, last: id }));
		setExpand(false);
		updateBook();
	};

	onMount(() => {
		app.on(`notebook-${card.name}-settings`, showSettings);
		app.on("tags", setHollowTags);
		card.toolEvent.on(`${card.name}-remove-entry`, removeNote);
	});
	onCleanup(() => {
		app.off(`notebook-${card.name}-settings`, showSettings);
		app.off("tags", setHollowTags);
		card.toolEvent.off(`${card.name}-remove-entry`, removeNote);
	});

	return (
		<div
			class="@container relative flex h-full w-full flex-col items-center"
			oncontextmenu={onContextMenu}
		>
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
								editMode() && onSave();
								setEditMode((prev: boolean) => !prev);
							}}
							style={{
								"--p": 1,
								"--border-radius": "var(--radius-sm)",
							}}
						>
							<Show
								when={editMode()}
								fallback={<FolderEdit class="size-5" />}
							>
								<FolderCheck class="size-5" />
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
						<FolderAdd class="size-5" />
					</button>
					<button
						class="button-control"
						onclick={() => setExpand((prev: boolean) => !prev)}
						style={{
							"--p": 1,
							"--border-radius": "var(--radius-sm)",
						}}
					>
						<FolderDocument class="size-5" />
					</button>
				</div>
			</div>
			{/* Body */}
			<Presence exitBeforeEnter>
				<Show when={panel() === 2}>
					<Motion
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						class="flex min-h-0 w-full flex-1 flex-col"
					>
						<div
							class="border-secondary-05 relative bottom-0 mx-auto mt-3 box-border h-30 w-full overflow-hidden rounded border opacity-100 transition-all group-hover:opacity-100"
							style={{
								"background-image": `linear-gradient(to right, var(--secondary-color-05), transparent), url(${selected().banner})`,
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
														tags: tgs,
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
											<For each={selected().tags}>
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
						<div class="flex w-full flex-1 shrink-0 justify-center overflow-hidden overflow-y-scroll">
							<div class="w-full px-5">
								<MarkdownEditor
									editMode={editMode}
									value={() => selected().content}
									setValue={(v) =>
										setSelected((prev) => ({
											...prev,
											content: v,
										}))
									}
									uniqueNote={() =>
										`${book().name.toLowerCase()}-${selected().title.toLowerCase()}`
									}
								/>
							</div>
						</div>
					</Motion>
				</Show>
				<Show when={panel() === 0}>
					<Motion
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						class="flex h-full w-full items-center justify-center"
					>
						<NotebookTabsIcon class="text-secondary-10 h-50 w-50" />
					</Motion>
				</Show>
				{/* Notes List */}
				<Show when={panel() === 1}>
					<NoteList {...{ book, hollowTags, changeSelected }} />
				</Show>
			</Presence>
		</div>
	);
}

type NoteListProps = {
	book: Accessor<NotebookType>;
	hollowTags: Accessor<TagType[]>;
	changeSelected: (id: string) => void;
};
function NoteList({ book, hollowTags, changeSelected }: NoteListProps) {
	const [selectedGroup, setSelectedGroup] = createSignal([]);

	const removeGroup = () => {
		// TODO send confirm message
	};
	return (
		<Motion
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			class="bg-secondary flex h-full w-full flex-wrap justify-center p-5"
		>
			<For each={book().notes}>
				{(note) => (
					<NotePreview
						{...{ note, changeSelected, setSelectedGroup }}
					/>
				)}
			</For>
		</Motion>
	);
}

type NotePreviewProps = {
	note: NoteType;
	changeSelected: (id: string) => void;
	setSelectedGroup: Setter<string[]>;
};
function NotePreview({
	note,
	changeSelected,
	setSelectedGroup,
}: NotePreviewProps) {
	const handleCheckMark = (
		e: Event & { currentTarget: HTMLInputElement },
	) => {
		e.stopPropagation();
		setSelectedGroup((prev) =>
			prev.includes(note.id)
				? prev.filter((i) => i !== note.id)
				: [...prev, note.id],
		);
	};
	return (
		<div
			class="group bg-secondary-05 hover:border-secondary-10 relative flex h-fit w-50 cursor-pointer flex-col overflow-hidden rounded-lg border border-transparent shadow-sm transition-all hover:shadow-md"
			onclick={() => changeSelected(note.id)}
		>
			<input
				type="checkbox"
				class="absolute top-1 left-1 size-5 opacity-0 group-hover:opacity-100"
				onclick={handleCheckMark}
			/>
			<Show
				when={note.banner}
				fallback={
					<div class="bg-secondary-10 flex h-28 w-full items-center justify-center">
						<FileDocument class="size-8 text-neutral-400" />
					</div>
				}
			>
				<img
					src={note.banner}
					alt=""
					class="h-28 w-full object-cover"
				/>
			</Show>

			<div class="flex flex-col gap-1 p-2 px-3 text-xs text-neutral-500">
				<h2 class="truncate text-lg font-medium text-neutral-800 dark:text-neutral-200">
					{note.title}
				</h2>
				<span class="truncate" title={note.tags.join(", ")}>
					Tags: {note.tags.join(", ")}
				</span>
				<span class="truncate">
					Created: {timeDifference(note.dates.createdAt)}
				</span>
			</div>
		</div>
	);
}
