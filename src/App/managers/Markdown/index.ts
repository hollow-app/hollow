import { marked } from "marked";
import GithubSlugger from "github-slugger";
import { hollow } from "../../../hollow";

const slugger = new GithubSlugger();
let noteId: string;
let renderer: InstanceType<typeof marked.Renderer>;
let checkboxIndex = 0;
let hljs: any;
const loadedLanguages = new Set<string>();

hollow.pevents.on("post-realm", async () => {
	await start();
});

hollow.events.on(
	"render-markdown",
	({ id, text }: { id: string; text: string }) => renderMarkdown(text, id),
);

async function start() {
	const { default: highlight } = await import("highlight.js/lib/core");
	hljs = highlight;
	// @ts-ignore
	window.hljs = highlight; // Expose to window for CDN scripts

	const { default: markedKatex } = await import("marked-katex-extension");

	renderer = new marked.Renderer();

	renderer.heading = ({ text, depth }) => {
		const slug = slugger.slug(cleanHeadingText(text));
		const id = `${noteId}-${slug}`;
		return `<h${depth} id="${id}">${text}</h${depth}>`;
	};

	renderer.code = ({ text, lang, escaped }) => {
		let highlighted: string;

		if (lang && hljs.getLanguage(lang)) {
			// Use the provided language
			highlighted = hljs.highlight(text, {
				language: lang,
			}).value;
		} else {
			// Fallback to auto-detect or plaintext safely
			highlighted = hljs.highlightAuto(text).value;
		}

		return `<pre><code class="hljs ${lang}">${
			escaped
				? highlighted.replace(/</g, "&lt;").replace(/>/g, "&gt;")
				: highlighted
		}</code></pre>`;
	};

	renderer.link = ({ text, href }) => {
		const match = href.match(/^(#+)(.+)/);
		if (match && !href.includes(noteId)) {
			const hashes = match[1];
			const title = match[2].trim();
			href = `${hashes}${noteId}-${title}`;
		}
		return `<a href="${href}" ${!href[0].startsWith("#") && 'target="_blank"'}>${text}</a>`;
	};

	const originalListItem = renderer.listitem.bind(renderer);

	renderer.listitem = (item) => {
		if (!item.task) {
			return originalListItem(item);
		}

		const index = ++checkboxIndex;
		const checkboxId = `hollow-${noteId}-task-${index}`;
		const checkedAttr = item.checked ? "checked" : "";

		return `
<li class="task-item">
<div class="checkbox md">
	<div class="round">
		<input type="checkbox" id="${checkboxId}" ${checkedAttr} />
		<label for="${checkboxId}"></label>
	</div>
</div>
<span class="task-text">${item.text}</span>
</li>
`.trim();
	};

	marked.use(markedKatex());
	marked.setOptions({ renderer: renderer });
}

function cleanHeadingText(text: string): string {
	return text
		.replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
		.replace(/^[^\p{L}\p{N}]+/gu, "")
		.trim();
}

async function loadLanguage(lang: string) {
	if (loadedLanguages.has(lang)) return;
	if (hljs.getLanguage(lang)) {
		loadedLanguages.add(lang);
		return;
	}

	try {
		const response = await fetch(
			`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/languages/${lang}.min.js`,
		);
		if (!response.ok) throw new Error("Language not found");
		const script = await response.text();
		// Execute script in global scope where window.hljs is defined
		new Function(script)();
		loadedLanguages.add(lang);
	} catch (e) {
		console.warn(`Failed to load language: ${lang}`, e);
	}
}

async function preloadLanguages(markdown: string) {
	const codeBlockRegex = /^```(\w+)/gm;
	const matches = [...markdown.matchAll(codeBlockRegex)];
	const languages = new Set(matches.map((m) => m[1]));

	await Promise.all(Array.from(languages).map((lang) => loadLanguage(lang)));
}

export async function renderMarkdown(
	markdown: string,
	id: string,
): Promise<string> {
	noteId = id;
	// for unique elements
	slugger.reset();
	checkboxIndex = 0;

	if (hljs) {
		await preloadLanguages(markdown);
	}

	return await marked(markdown);
}

export function getHeaders(
	markdown: string,
	id: string,
): { depth: number; text: string; id: string }[] {
	slugger.reset();
	const tokens = marked.lexer(markdown);
	const headers = tokens
		.filter((token) => token.type === "heading")
		.map((token) => {
			const slug = slugger.slug(
				// @ts-ignore
				cleanHeadingText(token.text),
			);
			const headerId = `${id}-${slug}`;
			return {
				// @ts-ignore
				depth: token.depth,
				// @ts-ignore
				text: token.text,
				id: headerId,
			};
		});
	return headers;
}
