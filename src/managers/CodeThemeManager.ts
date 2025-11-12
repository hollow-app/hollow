import { RealmManager } from "./RealmManager";

export class CodeThemeManager {
	private db!: IDBDatabase;
	private readonly dbName = "codeThemeDB";
	private readonly storeName = "themes";
	private readonly lastThemeKey = `${RealmManager.getSelf().currentRealmId}-last-theme`;
	private readonly max = 10;
	private readonly styleId = "hljs-theme-style";
	private static self: CodeThemeManager;

	static init() {
		if (!this.self) {
			this.self = new CodeThemeManager();
		}
	}
	static getSelf() {
		this.init();
		return this.self;
	}

	private constructor(defaultTheme = "default") {
		this.init().then(() => this.applyLastUsedTheme(defaultTheme));
	}

	private async init() {
		this.db = await new Promise<IDBDatabase>((resolve, reject) => {
			const req = indexedDB.open(this.dbName, 1);
			req.onupgradeneeded = () =>
				req.result.createObjectStore(this.storeName, {
					keyPath: "name",
				});
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
		});
	}

	private store(mode: IDBTransactionMode) {
		return this.db
			.transaction(this.storeName, mode)
			.objectStore(this.storeName);
	}

	async loadTheme(name: string) {
		let css = await this.getCachedTheme(name);
		if (!css) {
			css = await this.fetchTheme(name);
			await this.saveTheme(name, css);
			await this.evictOldThemes();
		}
		this.applyTheme(css);
		localStorage.setItem(this.lastThemeKey, name);
	}

	private async getCachedTheme(name: string) {
		return new Promise<string | null>((resolve) => {
			const req = this.store("readonly").get(name);
			req.onsuccess = () => {
				const theme = req.result;
				if (theme) {
					theme.lastUsed = Date.now();
					this.store("readwrite").put(theme);
				}
				resolve(theme?.css || null);
			};
			req.onerror = () => resolve(null);
		});
	}

	private async saveTheme(name: string, css: string) {
		this.store("readwrite").put({ name, css, lastUsed: Date.now() });
	}

	private async evictOldThemes() {
		const store = this.store("readwrite");
		const req = store.getAll();

		await new Promise<void>((resolve) => {
			req.onsuccess = () => {
				const themes = req.result;
				if (themes.length <= this.max) return resolve();

				themes
					.sort((a: any, b: any) => a.lastUsed - b.lastUsed)
					.slice(0, themes.length - this.max)
					.forEach((t) => store.delete(t.name));

				resolve();
			};
		});
	}

	private async fetchTheme(name: string) {
		const res = await fetch(
			`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.0/styles/${name}.min.css`,
		);
		if (!res.ok) throw new Error("Theme download failed");
		return res.text();
	}

	private applyTheme(css: string) {
		let el = document.getElementById(this.styleId) as HTMLStyleElement;
		if (!el)
			document.head.append(
				(el = Object.assign(document.createElement("style"), {
					id: this.styleId,
				})),
			);
		el.textContent = css;
	}

	private applyLastUsedTheme(fallback: string) {
		return this.loadTheme(
			localStorage.getItem(this.lastThemeKey) || fallback,
		);
	}
}
