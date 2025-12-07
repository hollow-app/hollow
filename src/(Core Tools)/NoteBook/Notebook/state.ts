import {
	Accessor,
	createEffect,
	createResource,
	createSignal,
	on,
	Setter,
} from "solid-js";
import { NotebookProps } from ".";
import type { HelperType } from "./helper";
import { NotebookType } from "../NotebookType";
import { NoteType } from "../NoteType";
import { createMemo } from "solid-js";
import { TagType } from "@type/hollow";
import { createStore, SetStoreFunction } from "solid-js/store";
import { hollow } from "hollow";

export type StateType = {
	showList: Accessor<boolean>;
	setShowList: Setter<boolean>;
	isExpand: Accessor<boolean>;
	setExpand: Setter<boolean>;
	editMode: Accessor<boolean>;
	setEditMode: Setter<boolean>;
	book: NotebookType;
	setBook: SetStoreFunction<NotebookType>;
	note: Accessor<NoteType>;
	setNote: Setter<NoteType>;
	panel: Accessor<number>;
	hollowTags: Accessor<TagType[]>;
	setHollowTags: Setter<TagType[]>;
	portalTarget: Accessor<{ el: HTMLElement; close: () => void } | null>;
};

export const createNotebookState = (
	props: NotebookProps,
	helper?: HelperType,
): StateType => {
	const [showList, setShowList] = createSignal(false);
	const [isExpand, setExpand] = createSignal(false);
	const [editMode, setEditMode] = createSignal(false);
	const [book, setBook] = createStore<NotebookType>(props.noteBook);
	const [note, setNote] = createSignal<NoteType>(
		book.last ? book.notes.find((i) => i.title === book.last) : null,
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
		props.card.app.getData("tags"),
	);

	const [portalTarget] = createResource(isExpand, async () => {
		const id = crypto.randomUUID();
		const { close } = await hollow.events.getData("add-layout")({
			type: "left",
			id,
			onClose: () => setExpand(false),
		});
		return { el: document.getElementById(id), close };
	});
	createEffect(
		on(
			isExpand,
			(v) => {
				if (!v) {
					portalTarget().close();
				}
			},
			{ defer: true },
		),
	);

	return {
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
		hollowTags,
		setHollowTags,
		portalTarget,
	};
};
