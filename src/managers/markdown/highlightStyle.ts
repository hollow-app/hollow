import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const {
	heading1,
	heading2,
	heading3,
	heading4,
	link,
	emphasis,
	strong,
	monospace,
	content,
	meta,
} = tags;

export default HighlightStyle.define([
	{
		tag: heading1,
		fontWeight: "bold",

		fontSize: "32px",
		textDecoration: "none",
	},
	{
		tag: heading2,
		fontWeight: "bold",

		fontSize: "28px",
		textDecoration: "none",
	},
	{
		tag: heading3,
		fontWeight: "bold",

		fontSize: "24px",
		textDecoration: "none",
	},
	{
		tag: heading4,
		fontWeight: "bold",

		fontSize: "22px",
		textDecoration: "none",
	},
	{
		tag: link,

		textDecoration: "underline",
		color: "var(--color-primary)",
	},
	{ tag: emphasis, fontStyle: "italic" },
	{ tag: strong, fontWeight: "bold" },
	{ tag: monospace, fontFamily: "monospace" },
	{ tag: content, fontFamily: "Inter" },
	{ tag: meta, color: "var(--secondary-color-60)" },
]);
