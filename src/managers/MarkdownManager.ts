import { marked } from "marked";
import GithubSlugger from "github-slugger";
import { hollow } from "hollow";

export class MarkdownManager {
	private slugger = new GithubSlugger();
	private noteId: string;
	private renderer!: InstanceType<typeof marked.Renderer>;
	private isRendererSetup = false;
	private static self: MarkdownManager;

	static getSelf() {
		if (!this.self) {
			this.self = new MarkdownManager();
		}
		return this.self;
	}
	constructor() {
		hollow.events.on(
			"render-markdown",
			({ id, text }: { id: string; text: string }) =>
				MarkdownManager.getSelf().renderMarkdown(text, id),
		);
	}

	private async setupRenderer() {
		if (this.isRendererSetup) return;

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
			return `<a href="${href}" target="_blank">${text}</a>`;
		};

		marked.use(markedKatex());
		marked.setOptions({ renderer: this.renderer });

		this.isRendererSetup = true;
	}

	private cleanHeadingText(text: string): string {
		return text
			.replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
			.replace(/^[^\p{L}\p{N}]+/gu, "")
			.trim();
	}

	async renderMarkdown(markdown: string, id: string): Promise<string> {
		this.noteId = id;
		this.slugger.reset();
		await this.setupRenderer();
		return marked(markdown);
	}

	getSlug(text: string): string {
		return this.slugger.slug(this.cleanHeadingText(text));
	}
}
