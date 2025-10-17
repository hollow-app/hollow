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
		fontFamily: "sans-serif",
		fontSize: "32px",
		textDecoration: "none",
	},
	{
		tag: heading2,
		fontWeight: "bold",
		fontFamily: "sans-serif",
		fontSize: "28px",
		textDecoration: "none",
	},
	{
		tag: heading3,
		fontWeight: "bold",
		fontFamily: "sans-serif",
		fontSize: "24px",
		textDecoration: "none",
	},
	{
		tag: heading4,
		fontWeight: "bold",
		fontFamily: "sans-serif",
		fontSize: "22px",
		textDecoration: "none",
	},
	{
		tag: link,
		fontFamily: "sans-serif",
		textDecoration: "underline",
		color: "var(--color-primary)",
	},
	{ tag: emphasis, fontFamily: "sans-serif", fontStyle: "italic" },
	{ tag: strong, fontFamily: "sans-serif", fontWeight: "bold" },
	{ tag: monospace, fontFamily: "monospace" },
	{ tag: content, fontFamily: "sans-serif" },
	{ tag: meta, color: "var(--secondary-color-60)" },
]);
