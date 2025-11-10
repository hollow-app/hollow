import {
	createCodeMirror,
	createEditorControlledValue,
} from "solid-codemirror";
import {
	Accessor,
	createEffect,
	createResource,
	createSignal,
	Suspense,
} from "solid-js";
import {
	drawSelection,
	EditorView,
	highlightSpecialChars,
	keymap,
} from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import { markDownTheme } from "@managers/markdown/markdownTheme";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { syntaxHighlighting } from "@codemirror/language";
import highlightStyle from "@managers/markdown/highlightStyle";
import { Show } from "solid-js";
import { MarkdownManager } from "@managers/MarkdownManager";

const codemirrorSetup = (() => [
	highlightSpecialChars(),
	history(),
	drawSelection(),
	syntaxHighlighting(highlightStyle),
	markdown({}),
	keymap.of([...defaultKeymap, ...historyKeymap]),
	EditorView.lineWrapping,
])();

type MarkdownEditorProps = {
	editMode: Accessor<boolean>;
	value: () => string;
	setValue: (s: string) => void;
	uniqueNote: () => string;
};
export default function MarkdownEditor({
	editMode,
	value,
	setValue,
	uniqueNote,
}: MarkdownEditorProps) {
	const [parsedMd] = createResource(value, () =>
		MarkdownManager.getSelf().renderMarkdown(value(), uniqueNote()),
	);
	const [inValue, setInValue] = createSignal(value());
	const {
		editorView,
		createExtension,
		ref: editorRef,
	} = createCodeMirror({
		value: value(),
		onValueChange: (v: string) => {
			setValue(v);
			setInValue(v);
		},
	});
	createEditorControlledValue(editorView, value);
	//
	createExtension(EditorView.theme(markDownTheme));
	createExtension(codemirrorSetup);

	return (
		<div class="relative h-fit w-full shrink-0">
			<Show when={editMode() && inValue() === ""}>
				<p class="text-secondary-30 absolute top-0 left-[6px] text-xl">
					{
						placeholders[
							Math.floor(Math.random() * placeholders.length)
						]
					}
				</p>
			</Show>
			<div
				class={
					"h-full max-w-full overflow-x-hidden text-gray-900 dark:text-gray-50"
				}
				classList={{ hidden: !editMode() }}
				ref={editorRef}
			/>
			<Show when={!editMode() && parsedMd()}>
				<Suspense
					fallback={
						<div class="flex h-full w-full items-center justify-center">
							<div class="chaotic-orbit" />
						</div>
					}
				>
					<div
						class="markdown-preview pt-2 pb-4"
						innerHTML={parsedMd()}
					/>
				</Suspense>
			</Show>
		</div>
	);
}

const placeholders: string[] = [
	"Every great idea starts with a single note! ✨",
	"Write something awesome today! 📝",
	"A blank page is full of possibilities. 🌱",
	"Let your thoughts take off! 🚀",
	"Jot down your next big idea here! 💡",
	"Take a moment, write something inspiring. ☕",
	"Your thoughts matter, write them down! 🌟",
	"Let your creativity flow onto this page. 🎨",
	"Every note is a step in your story. 📖",
	"Bright ideas start with a single word! 🌈",
	"The future is written one note at a time. 🔮",
	"Piece together your best thoughts here. 🧩",
	"Your words have power, start writing! 💬",
	"A fresh note for fresh ideas! 🌞",
	"Build something great with your words. 🛠️",
	"Capture your genius before it fades! 🧠",
	"Let your ideas sing on this page. 🎶",
	"Map out your thoughts, one note at a time. 🗺️",
	"Lucky you! A new note to fill with brilliance. 🍀",
	"Pin down your ideas before they float away! 📌",
	"Big dreams start with small notes. 💭",
	"Today’s thoughts could shape tomorrow! 📅",
	"Every masterpiece begins with a rough draft. 📜",
	"A note full of potential—let’s go! 🎈",
	"Spark a new idea right here! 🔥",
	"Set your thoughts free on this page. 🕊️",
	"Power up your creativity with a new note! ⚡",
	"Focus your thoughts, one note at a time. 🎯",
	"Lay the foundation for something amazing. 🏗️",
	"The key to great ideas? Writing them down! 🔑",
];
