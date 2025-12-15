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
import { hollow } from "hollow";
import { unwrap } from "solid-js/store";
import { MyIconFun } from "@components/MyIcon";

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
		hollow.events.emit("character-add-achievement", "📚 Archivist");
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
		state.setNote(newNote);
		state.setShowList(false);
		// changeSelected(newNote.title);
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
					props.card.data.name,
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
				hollow.events.emit("alert", {
					type: "error",
					title: "Notebook",
					message: `Title "${state.note().title}" already exists`,
				});
			}
		} else {
			// editing existing note
			if (isDuplicateTitle) {
				hollow.events.emit("alert", {
					type: "error",
					title: "Notebook",
					message: `Title "${state.note().title}" already exists`,
				});
				return;
			}

			await NotebookManager.getSelf().setNote(
				props.card.data.name,
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
		hollow.events.emit("show-vault", {
			onSelect: async (url: string) => {
				state.setNote((prev) => ({
					...prev,
					attributes: { ...prev.attributes, banner: url },
				}));
				await NotebookManager.getSelf().setNote(
					props.card.data.name,
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
		NotebookManager.getSelf().deleteNote(props.card.data.name, title);
	};
	//
	const onContextMenu = () => {
		const cmItems: ContextMenuItem = {
			id: `notebook-${props.card.data.name}`,
			header: "Note",
			items: [
				{
					icon: MyIconFun({ name: "image" }),
					label: "Change Banner",
					onclick: changeBanner,
				},
				...(state.note()
					? [
							{
								icon: MyIconFun({ name: "trash" }),
								label: "Delete Note",
								onclick: () => {
									removeNote(state.note().title);
								},
							},
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
						<div class="w-full">
							<div class="w-full">
								<h1 class="text-lg font-bold">Structure</h1>
								<h3 class="text-secondary-40">
									Template structure for new notes.
								</h3>
							</div>
							<TextareaAutosize
								class="input"
								style={{
									"--bg-color": "var(--color-secondary-10)",
								}}
								value={state.book.structure}
								onChange={(e) =>
									state.setBook(
										"structure",
										e.currentTarget.value,
									)
								}
							/>
						</div>
					),
				},
			],
		};
		hollow.events.emit("tool-settings", settings);
	};

	const changeSelected = async (title: string) => {
		state.setNote(unwrap(state.book).notes.find((i) => i.title === title));
		state.setBook((prev) => ({ ...prev, last: title }));
		state.setShowList(false);
		updateBook();
	};
	const onFolder = () => {
		state.setShowList((prev: boolean) => !prev);
	};
	onMount(() => {
		const toolEvents = NotebookManager.getSelf().getEvents();
		toolEvents.on(`${props.card.id}-settings`, showSettings);
		toolEvents.on(`${props.card.id}-expand`, state.setExpand);
	});
	onCleanup(() => {
		const toolEvents = NotebookManager.getSelf().getEvents();
		toolEvents.off(`${props.card.id}-settings`, showSettings);
		toolEvents.off(`${props.card.id}-expand`, state.setExpand);
	});
	return {
		onSave,
		onNewNote,
		onContextMenu,
		changeSelected,
		onFolder,
	};
};
