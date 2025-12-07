import { NotebookProps } from ".";
import TextareaAutosize from "solid-textarea-autosize";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { NotebookManager } from "../NotebookManager";
import { NoteType } from "../NoteType";
import fm from "front-matter";
import { NotebookType } from "../NotebookType";
import { ContextMenuItem, ToolOptions } from "@type/hollow";
import { createEffect, createRoot, on, onMount } from "solid-js";
import { onCleanup } from "solid-js";
import { ImageIcon, Trash2Icon } from "lucide-solid";
import { hollow } from "hollow";
import { Portal, render } from "solid-js/web";
import NoteList from "./NoteList";
import { unwrap } from "solid-js/store";

export type LogicType = {
	onSave: () => Promise<void>;
	onNewNote: () => void;
	onContextMenu: () => void;
	changeSelected: (title: string) => Promise<void>;
	onFolder: () => void;
};

export const NotebookLogic = (
	state: StateType,
	props: NotebookProps,
	helper?: HelperType,
): LogicType => {
	const updateBook = () => {
		NotebookManager.getSelf().setNotebook(unwrap(state.book));
	};

	const onNewNote = () => {
		// TODO
		// setBook(prev=>({...prev, last: "new-00-note" }));
		const data: any = fm(state.book.structure);
		const newNote: NoteType = {
			...data,
			attributes: {
				...data.attributes,
				id: crypto.randomUUID(),
			},
			newNote: true,
			title: "Note",
		};
		// state.setNote(newNote);
		// state.setShowList(false);
		changeSelected(newNote.title);
		state.setEditMode(true);
	};

	const onSave = async () => {
		const isDuplicateTitle = state.book.notes.some(
			(note) =>
				note.title === state.note().title &&
				note.title !== state.book.last,
		);
		if (state.note().newNote) {
			if (!isDuplicateTitle) {
				NotebookManager.getSelf().setNote(
					props.card.data.extra.name,
					state.note().title,
					NotebookManager.getSelf().rebuildMarkdown(state.note()),
				);

				state.setEditMode(false);
				state.setNote((prev) => ({ ...prev, newNote: false }));
				state.setBook((prev) => ({
					...prev,
					notes: [...prev.notes, state.note()],
				}));
				updateBook();
			} else {
				props.card.app.emit("alert", {
					type: "error",
					title: "Notebook",
					message: `Title "${state.note().title}" already exists`,
				});
			}
		} else {
			// editing existing note
			if (isDuplicateTitle) {
				props.card.app.emit("alert", {
					type: "error",
					title: "Notebook",
					message: `Title "${state.note().title}" already exists`,
				});
				return;
			}

			await NotebookManager.getSelf().setNote(
				props.card.data.extra.name,
				state.book.last,
				NotebookManager.getSelf().rebuildMarkdown(state.note()),
				state.note().title,
			);

			state.setBook((prev) => ({
				...prev,
				notes: prev.notes.map((note) =>
					note.title === prev.last
						? { ...note, ...state.note() }
						: note,
				),
				last: state.note().title,
			}));

			updateBook();
			state.setEditMode(false);
		}
	};

	const changeBanner = async () => {
		props.card.app.emit("show-vault", {
			onSelect: async (url: string) => {
				state.setNote((prev) => ({
					...prev,
					attributes: { ...prev.attributes, banner: url },
				}));
				await NotebookManager.getSelf().setNote(
					props.card.data.extra.name,
					state.note().title,
					NotebookManager.getSelf().rebuildMarkdown(state.note()),
				);
			},
		});
	};
	const removeNote = (title: string) => {
		if (state.note().title === title) {
			state.setNote(null);
			state.setEditMode(false);
		}
		state.setBook((prev: NotebookType) => ({
			...prev,
			last: null,
			notes: prev.notes.filter((i) => i.title !== title),
		}));
		NotebookManager.getSelf().deleteNote(props.card.data.extra.name, title);
	};
	//
	const onContextMenu = () => {
		const cmItems: ContextMenuItem = {
			id: `notebook-${props.card.data.extra.name}`,
			header: "Note",
			items: [
				{
					icon: ImageIcon,
					label: "Change Banner",
					onclick: changeBanner,
				},
				...(state.note()
					? [
							{
								icon: Trash2Icon,
								label: "Delete Note",
								onclick: () => {
									removeNote(state.note().title);
								},
							},
						]
					: []),
			],
		};
		props.card.app.emit("context-menu-extend", cmItems);
	};
	const showSettings = () => {
		const settings: ToolOptions = {
			tool: "NoteBook",
			card: props.card.data.extra.name,
			save: updateBook,
			options: [
				{
					type: "text",
					label: "Name",
					description: "Note Book's name",
					value: state.book.name,
					onAction: (v: string) =>
						state.setBook((prev) => ({
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
							value={state.book.structure}
							onChange={(e) =>
								state.setBook((prev) => ({
									...prev,
									structure: e.currentTarget.value,
								}))
							}
						/>
					),
				},
			],
		};
		props.card.app.emit("tool-settings", settings);
	};

	const changeSelected = async (title: string) => {
		// const content = await NotebookManager.getSelf().getNote(
		// 	card.name,
		// 	title,
		// );
		state.setNote(unwrap(state.book).notes.find((i) => i.title === title));
		state.setBook((prev) => ({ ...prev, last: title }));
		state.setShowList(false);
		updateBook();
	};
	const onFolder = () => {
		state.setShowList((prev: boolean) => !prev);
	};
	onMount(() => {
		props.card.toolEvent.on(`${props.card.id}-settings`, showSettings);
		props.card.app.on("tags", state.setHollowTags);
		props.card.toolEvent.on(`${props.card.id}-expand`, state.setExpand);
	});
	onCleanup(() => {
		props.card.toolEvent.off(`${props.card.id}-settings`, showSettings);
		props.card.app.off("tags", state.setHollowTags);
		props.card.toolEvent.off(`${props.card.id}-expand`, state.setExpand);
	});
	return {
		onSave,
		onNewNote,
		onContextMenu,
		changeSelected,
		onFolder,
	};
};
