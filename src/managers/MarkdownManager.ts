import { marked } from "marked";
import GithubSlugger from "github-slugger";
import { hollow } from "hollow";
import { Managers } from ".";

export class MarkdownManager {
	private readonly managers: Managers;
	private slugger = new GithubSlugger();
	private noteId: string;
	private renderer!: InstanceType<typeof marked.Renderer>;

	constructor(managers: Managers) {
		this.managers = managers;
		hollow.events.on(
			"render-markdown",
			({ id, text }: { id: string; text: string }) =>
				this.managers?.markdown.renderMarkdown(text, id),
		);
	}

	async start() {
		const { default: hljs } = await import("highlight.js");
		const { default: markedKatex } = await import("marked-katex-extension");

		this.renderer = new marked.Renderer();

		this.renderer.heading = ({ text, depth }) => {
			const slug = this.slugger.slug(this.cleanHeadingText(text));
			const id = `${this.noteId}-${slug}`;
			return `<h${depth} id="${id}">${text}</h${depth}>`;
		};

		this.renderer.code = ({ text, lang, escaped }) => {
			const validLang = hljs.getLanguage(lang) ? lang : "plaintext";
			const highlighted = hljs.highlight(text, {
				language: validLang,
			}).value;
			return `<pre><code class="hljs ${lang}">${
				escaped
					? highlighted.replace(/</g, "&lt;").replace(/>/g, "&gt;")
					: highlighted
			}</code></pre>`;
		};

		this.renderer.link = ({ text, href }) => {
			const match = href.match(/^(#+)(.+)/);
			if (match && !href.includes(this.noteId)) {
				const hashes = match[1];
				const title = match[2].trim();
				href = `${hashes}${this.noteId}-${title}`;
			}
			return `<a href="${href}" ${!href[0].startsWith("#") && 'target="_blank"'}>${text}</a>`;
		};

		marked.use(markedKatex());
		marked.setOptions({ renderer: this.renderer });
	}

	private cleanHeadingText(text: string): string {
		return text
			.replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
			.replace(/^[^\p{L}\p{N}]+/gu, "")
			.trim();
	}

	async renderMarkdown(markdown: string, id: string): Promise<string> {
		this.noteId = id;
		// for unique elements
		this.slugger.reset();
		return await marked(markdown);
	}

	getHeaders(
		markdown: string,
		id: string,
	): { depth: number; text: string; id: string }[] {
		this.slugger.reset();
		const tokens = marked.lexer(markdown);
		const headers = tokens
			.filter((token) => token.type === "heading")
			.map((token) => {
				const slug = this.slugger.slug(
					// @ts-ignore
					this.cleanHeadingText(token.text),
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
}
