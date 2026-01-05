import {
	createSignal,
	createMemo,
	createEffect,
	on,
	onMount,
	onCleanup,
	Accessor,
	Setter,
} from "solid-js";
import { createStore, SetStoreFunction, unwrap } from "solid-js/store";
import fm from "front-matter";
import { hollow } from "hollow";
import { manager } from "@managers/index";
import { NotebookType } from "../NotebookType";
import { NoteType } from "../NoteType";
import {
	CardType,
	ContextMenuItem,
	ContextMenuItemButton,
	ToolOptions,
} from "@type/hollow";
import { NotebookManager } from "../NotebookManager";
import { MyIconFun } from "@components/MyIcon";

export interface NotebookProps {
	card: CardType;
	noteBook: NotebookType;
}

export interface NotebookState {
	showList: Accessor<boolean>;
	setShowList: Setter<boolean>;
	isExpand: Accessor<boolean>;
	setExpand: Setter<boolean>;
	editMode: Accessor<boolean>;
	setEditMode: Setter<boolean>;
	book: NotebookType;
	setBook: SetStoreFunction<NotebookType>;
	note: Accessor<NoteType | null>;
	setNote: Setter<NoteType | null>;
	panel: Accessor<number>;
}

export interface NotebookActions {
	onSave: () => Promise<void>;
	onNewNote: () => void;
	onContextMenu: () => void;
	changeSelected: (title: string) => Promise<void>;
	onFolder: () => void;
}

export interface NotebookHook {
	state: NotebookState;
	actions: NotebookActions;
}

export const useNotebook = (props: NotebookProps): NotebookHook => {
	const [showList, setShowList] = createSignal(false);
	const [isExpand, setExpand] = createSignal(false);
	const [editMode, setEditMode] = createSignal(false);
	const [book, setBook] = createStore<NotebookType>(props.noteBook);
	const [note, setNote] = createSignal<NoteType | null>(
		book.last
			? book.notes.find((i) => i.title === book.last) || null
			: null,
	);

	const panel = createMemo(() => {
		if (showList()) {
			return 1;
		} else if ((note() || editMode()) && !showList()) {
			return 2;
		} else {
			return 0;
		}
	});

	const updateBook = () => {
		NotebookManager.getSelf().setNotebook(unwrap(book));
	};

	const onNewNote = () => {
		hollow.events.emit("character-add-achievement", "📚 Archivist");
		const data: any = fm(book.structure);
		const newNote: NoteType = {
			...data,
			attributes: {
				...data.attributes,
				id: crypto.randomUUID(),
			},
			newNote: true,
			title: "Note",
		};
		setNote(newNote);
		setShowList(false);
		setEditMode(true);
	};

	const onSave = async () => {
		const currentNote = note();
		if (!currentNote) return;

		const isDuplicateTitle = book.notes.some(
			(n) => n.title === currentNote.title && n.title !== book.last,
		);

		if (currentNote.newNote) {
			if (!isDuplicateTitle) {
				NotebookManager.getSelf().setNote(
					props.card.data.name,
					currentNote.title,
					NotebookManager.getSelf().rebuildMarkdown(currentNote),
				);

				setEditMode(false);
				setNote((prev) => (prev ? { ...prev, newNote: false } : null));
				setBook((prev) => ({
					...prev,
					notes: [...prev.notes, currentNote],
				}));
				updateBook();
			} else {
				hollow.events.emit("alert", {
					type: "error",
					title: "Notebook",
					message: `Title "${currentNote.title}" already exists`,
				});
			}
		} else {
			if (isDuplicateTitle) {
				hollow.events.emit("alert", {
					type: "error",
					title: "Notebook",
					message: `Title "${currentNote.title}" already exists`,
				});
				return;
			}

			await NotebookManager.getSelf().setNote(
				props.card.data.name,
				book.last!,
				NotebookManager.getSelf().rebuildMarkdown(currentNote),
				currentNote.title,
			);

			setBook((prev) => ({
				...prev,
				notes: prev.notes.map((n) =>
					n.title === prev.last ? { ...n, ...currentNote } : n,
				),
				last: currentNote.title,
			}));

			updateBook();
			setEditMode(false);
		}
	};

	const changeBanner = async () => {
		hollow.events.emit("show-vault", {
			onSelect: async (url: string) => {
				setNote((prev) =>
					prev
						? {
								...prev,
								attributes: { ...prev.attributes, banner: url },
							}
						: null,
				);
				const currentNote = note();
				if (currentNote) {
					await NotebookManager.getSelf().setNote(
						props.card.data.name,
						currentNote.title,
						NotebookManager.getSelf().rebuildMarkdown(currentNote),
					);
				}
			},
		});
	};

	const removeNote = (title: string) => {
		const currentNote = note();
		if (currentNote && currentNote.title === title) {
			setNote(null);
			setEditMode(false);
		}
		setBook((prev: NotebookType) => ({
			...prev,
			last: null,
			notes: prev.notes.filter((i) => i.title !== title),
		}));
		NotebookManager.getSelf().deleteNote(props.card.data.name, title);
	};

	const onContextMenu = () => {
		const currentNote = note();
		const cmItems: ContextMenuItem = {
			id: `notebook-${props.card.data.name}`,
			header: "Note",
			items: [
				{
					icon: MyIconFun({ name: "image" }),
					label: "Change Banner",
					onclick: changeBanner,
				},
				...(currentNote
					? [
							{
								type: "top",
								icon: MyIconFun({ name: "trash-outline" }),
								label: "Delete Note",
								onclick: () => {
									removeNote(currentNote.title);
								},
							} as ContextMenuItemButton,
						]
					: []),
			],
		};
		hollow.events.emit("context-menu-extend", cmItems);
	};

	const showSettings = () => {
		const settings: ToolOptions = {
			tool: "NoteBook",
			card: props.card.data.name,
			save: updateBook,
			options: [
				{
					type: "text",
					label: "Name",
					description: "Note Book's name",
					value: book.name,
					onAction: (v: string) =>
						setBook((prev) => ({
							...prev,
							name: v,
						})),
				},
				{
					type: "longtext",
					label: "Structure",
					value: book.structure,
					description: "Customize the structure of the new notes",
					onAction: (v: string) => {
						setBook("structure", v);
					},
				},
			],
		};
		hollow.events.emit("tool-settings", settings);
	};

	const changeSelected = async (title: string) => {
		setNote(unwrap(book).notes.find((i) => i.title === title) || null);
		setBook((prev) => ({ ...prev, last: title }));
		setShowList(false);
		updateBook();
	};

	const onFolder = () => {
		setShowList((prev: boolean) => !prev);
	};

	onMount(() => {
		const toolEvents = NotebookManager.getSelf().getEvents();
		toolEvents.on(`${props.card.id}-settings`, showSettings);
		toolEvents.on(`${props.card.id}-expand`, setExpand);
	});

	onCleanup(() => {
		const toolEvents = NotebookManager.getSelf().getEvents();
		toolEvents.off(`${props.card.id}-settings`, showSettings);
		toolEvents.off(`${props.card.id}-expand`, setExpand);
	});

	return {
		state: {
			showList,
			setShowList,
			isExpand,
			setExpand,
			editMode,
			setEditMode,
			book,
			setBook,
			note,
			setNote,
			panel,
		},
		actions: {
			onSave,
			onNewNote,
			onContextMenu,
			changeSelected,
			onFolder,
		},
	};
};
