import { marked } from "marked";
import GithubSlugger from "github-slugger";
import { hollow } from "hollow";
import { Managers } from ".";

export class MarkdownManager {
	private readonly managers: Managers;
	private slugger = new GithubSlugger();
	private noteId: string;
	private renderer!: InstanceType<typeof marked.Renderer>;
	private checkboxIndex = 0;

	constructor(managers: Managers) {
		this.managers = managers;
		hollow.events.on(
			"render-markdown",
			({ id, text }: { id: string; text: string }) =>
				this.managers?.markdown.renderMarkdown(text, id),
		);
	}

	private hljs: any;
	private loadedLanguages = new Set<string>();

	async start() {
		const { default: hljs } = await import("highlight.js/lib/core");
		this.hljs = hljs;
		// @ts-ignore
		window.hljs = hljs; // Expose to window for CDN scripts

		const { default: markedKatex } = await import("marked-katex-extension");

		this.renderer = new marked.Renderer();

		this.renderer.heading = ({ text, depth }) => {
			const slug = this.slugger.slug(this.cleanHeadingText(text));
			const id = `${this.noteId}-${slug}`;
			return `<h${depth} id="${id}">${text}</h${depth}>`;
		};

		this.renderer.code = ({ text, lang, escaped }) => {
			let highlighted: string;

			if (lang && this.hljs.getLanguage(lang)) {
				// Use the provided language
				highlighted = this.hljs.highlight(text, {
					language: lang,
				}).value;
			} else {
				// Fallback to auto-detect or plaintext safely
				highlighted = this.hljs.highlightAuto(text).value;
			}

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

		const originalListItem = this.renderer.listitem.bind(this.renderer);

		this.renderer.listitem = (item) => {
			if (!item.task) {
				return originalListItem(item);
			}

			const index = ++this.checkboxIndex;
			const checkboxId = `hollow-${this.noteId}-task-${index}`;
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
		marked.setOptions({ renderer: this.renderer });
	}

	private cleanHeadingText(text: string): string {
		return text
			.replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
			.replace(/^[^\p{L}\p{N}]+/gu, "")
			.trim();
	}

	private async loadLanguage(lang: string) {
		if (this.loadedLanguages.has(lang)) return;
		if (this.hljs.getLanguage(lang)) {
			this.loadedLanguages.add(lang);
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
			this.loadedLanguages.add(lang);
		} catch (e) {
			console.warn(`Failed to load language: ${lang}`, e);
		}
	}

	private async preloadLanguages(markdown: string) {
		const codeBlockRegex = /^```(\w+)/gm;
		const matches = [...markdown.matchAll(codeBlockRegex)];
		const languages = new Set(matches.map((m) => m[1]));

		await Promise.all(
			Array.from(languages).map((lang) => this.loadLanguage(lang)),
		);
	}

	async renderMarkdown(markdown: string, id: string): Promise<string> {
		this.noteId = id;
		// for unique elements
		this.slugger.reset();
		this.checkboxIndex = 0;

		if (this.hljs) {
			await this.preloadLanguages(markdown);
		}

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
