import Tag from "@components/Tag";
import { TagType } from "@type/TagType";
import { DataBase, HollowEvent, ICard } from "hollow-api";
import {
	AlignJustifyIcon,
	FilePlusIcon,
	NotebookTabsIcon,
	PenLineIcon,
	SaveIcon,
} from "lucide-solid";
import { createSignal, For, lazy, onCleanup, onMount, Show } from "solid-js";
import { NoteBookType, NoteType } from "./NotebookMain";
import { SortableVerticalList } from "@components/SortableVerticalList";
import { ContextMenuItem } from "@type/ContextMenuItem";
import { ToolOptions } from "@type/ToolOptions";
import TextareaAutosize from "solid-textarea-autosize";
import { Motion, Presence } from "solid-motionone";
import { EntryData } from "@type/EntryData";

const MarkdownEditor = lazy(() => import("@components/MarkdownEditor"));
const WordInput = lazy(() => import("@components/WordInput"));

type NotebookProps = {
	card: ICard;
	app: HollowEvent;
	noteBook: NoteBookType;
	db: DataBase;
};
export default function Notebook({ card, noteBook, app, db }: NotebookProps) {
	const [expand, setExpand] = createSignal(false);
	const [editMode, setEditMode] = createSignal(false);
	const [book, setBook] = createSignal<NoteBookType>(noteBook);
	const [selected, setSelected] = createSignal<NoteType>(
		noteBook.last
			? noteBook.notes.find((i) => i.id === noteBook.last)
			: {
					...emptyNote,
					content: book().structure,
				},
	);
	const [hollowTags, setHollowTags] = createSignal<TagType[]>(
		app.getCurrentData("tags"),
	);

	const updateHollowTags = (newTags: TagType[]) => {
		setHollowTags(newTags);
	};
	const saveDB = () => {
		db.putData(card.name, book());
	};

	const onSave = () => {
		const note = selected();
		if (note.id) {
			setBook((prev: NoteBookType) => ({
				...prev,
				last: note.id,
				notes: prev.notes.map((mnote) =>
					mnote.id === note.id ? { ...note } : mnote,
				),
			}));
			saveDB();
			sendEntry({
				id: note.id,
				title: note.title,
				tags: note.tags,
				content: note.content,
				source: { tool: "notebook", card: card.name },
			});
		} else if (selected().title !== "") {
			const nId = crypto.randomUUID();
			setBook((prev: NoteBookType) => ({
				...prev,
				last: nId,
				notes: [
					...prev.notes,
					{
						...selected(),
						id: nId,
					},
				],
			}));
			setSelected(book().notes.find((i) => i.id === nId));
			saveDB();
			sendEntry({
				id: nId,
				title: note.title,
				tags: note.tags,
				content: note.content,
				source: { tool: "notebook", card: card.name },
			});
		}
	};
	const sendEntry = (entry: EntryData) => {
		app.emit("receive-entry", entry);
	};
	const changeBanner = async () => {
		// TODO vault image selector
		// const img = await importImage();
		// setSelected((prev: NoteType) => ({
		//         ...prev,
		//         banner: `${img}`,
		// }));
		// setBook((prev: NoteBookType) => ({
		//         ...prev,
		//         notes: prev.notes.map((i) =>
		//                 i.id === selected().id
		//                         ? { ...i, banner: `${img}` }
		//                         : i,
		//         ),
		// }));
		// saveDB();
	};
	const removeNote = (id: string, byNotebookComponent?: boolean) => {
		selected().id === id &&
			setSelected({
				...emptyNote,
				content: book().structure,
			});
		setBook((prev: NoteBookType) => ({
			...prev,
			last: null,
			notes: prev.notes.filter((i) => i.id !== id),
		}));
		saveDB();
		byNotebookComponent && app.emit("remove-entry", id);
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
				...(selected().id
					? [
							{
								icon: "Trash2",
								label: "Delete Note",
								onclick: () => removeNote(selected().id, true),
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
			save: () => {
				saveDB();
			},
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
					type: "number",
					label: "Font Size",
					description: "Change the font size",
					value: book().fontSize,
					onChange: (v: number) =>
						setBook((prev) => ({
							...prev,
							fontSize: v,
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
		saveDB();
	};

	onMount(() => {
		app.on(`notebook-${card.name}-settings`, showSettings);
		app.on("tags", updateHollowTags);
		card.toolEvent.on(`${card.name}-remove-entry`, removeNote);
	});
	onCleanup(() => {
		app.off(`notebook-${card.name}-settings`, showSettings);
		app.off("tags", updateHollowTags);
		card.toolEvent.off(`${card.name}-remove-entry`, removeNote);
	});

	return (
		<div
			class="@container relative flex h-full w-full flex-col items-center"
			oncontextmenu={onContextMenu}
			style={{ "font-size": `${book().fontSize}px` }}
		>
			<div class="border-secondary-05 hidden h-10 w-full shrink-0 items-center justify-between gap-4 border-b-1 @xs:flex">
				<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">
					{book().name} <span class="text-secondary-40">Book</span>
				</h1>
				<div class="flex gap-4">
					<button
						class="button-control"
						onclick={() => {
							setSelected({
								...emptyNote,
								content: book().structure,
							});
							setEditMode(true);
						}}
					>
						<FilePlusIcon />
					</button>

					<button
						class="button-control"
						onclick={() => {
							editMode() && onSave();
							setEditMode((prev: boolean) => !prev);
						}}
					>
						<Show when={editMode()} fallback={<PenLineIcon />}>
							<SaveIcon />
						</Show>
					</button>
					<button
						class="button-control"
						onclick={() => setExpand((prev: boolean) => !prev)}
					>
						<AlignJustifyIcon />
					</button>
				</div>
			</div>
			<div class="pointer-events-none absolute right-0 h-full w-fit max-w-[50%] min-w-[25%] overflow-hidden">
				<Presence>
					<Show when={expand()}>
						<Motion
							class="bg-secondary border-secondary-05 pointer-events-auto relative inset-y-0 top-10 z-1 ml-auto box-border flex h-full w-fit max-w-full flex-col items-end gap-2 overflow-hidden overflow-y-scroll border-l-1 p-3"
							initial={{
								right: "-100%",
							}}
							animate={{
								right: "0%",
							}}
							exit={{
								right: "-100%",
							}}
							transition={{
								duration: 0.2,
							}}
						>
							<SortableVerticalList
								items={() => book().notes}
								setItems={(newNotes) => {
									setBook((prev: NoteBookType) => ({
										...prev,
										notes: newNotes,
									}));
									saveDB();
								}}
								hollowTags={hollowTags}
								setExpand={setExpand}
								setSelected={changeSelected}
							/>
						</Motion>
					</Show>
				</Presence>
			</div>
			<Presence exitBeforeEnter>
				<Show when={selected().id || editMode()}>
					<Motion
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						class="flex min-h-0 w-full flex-1 flex-col"
					>
						<div
							class="border-secondary-10 relative bottom-0 mx-auto mt-3 box-border h-30 w-full overflow-hidden rounded-lg border-1 opacity-100 transition-all group-hover:opacity-100"
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
									class="border-secondary-10 w-full max-w-full overflow-hidden rounded text-[1.3em] font-extrabold text-ellipsis whitespace-nowrap text-gray-900 dark:text-gray-50"
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
									{editMode() ? (
										<WordInput
											words={() => selected().tags}
											setWords={(tgs) =>
												setSelected((prev) => ({
													...prev,
													tags: tgs,
												}))
											}
										/>
									) : (
										<div
											class="flex flex-wrap gap-1"
											style={{
												"font-size": "1.1em",
											}}
										>
											<For each={selected().tags}>
												{(tag, index) => {
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
															foreground={() =>
																target()
																	?.foreground ??
																"var(--color-secondary)"
															}
														/>
													);
												}}
											</For>
										</div>
									)}
								</div>
							</div>
						</div>
						<div class="flex w-full flex-1 shrink-0 justify-center overflow-hidden overflow-y-scroll">
							<div class="w-[80%]">
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
				<Show when={!selected().id && !editMode()}>
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
			</Presence>
		</div>
	);
}

const emptyNote: NoteType = {
	id: null,
	title: "",
	tags: [],
	content: ``,
};
