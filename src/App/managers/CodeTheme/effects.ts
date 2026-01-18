import { getCurrentRealm } from "@managers/Realm";
import { Events, CodeThemeState } from "./types";
import { hollow } from "../../../hollow";

const DB_NAME = "codeThemeDB";
const STORE_NAME = "themes";
const MAX_THEMES = 10;
const STYLE_ID = "hljs-theme-style";

let localDB: IDBDatabase | null = null;

function getLastThemeKey(realmId: string): string {
	return `${realmId}-last-theme`;
}

async function initDatabase(): Promise<IDBDatabase> {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () =>
			req.result.createObjectStore(STORE_NAME, {
				keyPath: "name",
			});
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function fetchTheme(name: string) {
	const res = await fetch(
		`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.0/styles/${name}.min.css`,
	);
	if (!res.ok) throw new Error("Theme download failed");
	return res.text();
}

function applyTheme(css: string) {
	let el = document.getElementById(STYLE_ID) as HTMLStyleElement;
	if (!el)
		document.head.append(
			(el = Object.assign(document.createElement("style"), {
				id: STYLE_ID,
			})),
		);
	el.textContent = css;
}

async function saveTheme(db: IDBDatabase, name: string, css: string) {
	db.transaction(STORE_NAME, "readwrite")
		.objectStore(STORE_NAME)
		.put({ name, css, lastUsed: Date.now() });
}

async function evictOldThemes(db: IDBDatabase) {
	const store = db
		.transaction(STORE_NAME, "readwrite")
		.objectStore(STORE_NAME);
	const req = store.getAll();

	await new Promise<void>((resolve) => {
		req.onsuccess = () => {
			const themes = req.result;
			if (themes.length <= MAX_THEMES) return resolve();

			themes
				.sort((a: any, b: any) => a.lastUsed - b.lastUsed)
				.slice(0, themes.length - MAX_THEMES)
				.forEach((t) => store.delete(t.name));

			resolve();
		};
	});
}

async function getCachedTheme(
	db: IDBDatabase,
	name: string,
): Promise<string | null> {
	return new Promise<string | null>((resolve) => {
		const store = db
			.transaction(STORE_NAME, "readonly")
			.objectStore(STORE_NAME);
		const req = store.get(name);
		req.onsuccess = () => {
			const theme = req.result;
			if (theme) {
				theme.lastUsed = Date.now();
				db.transaction(STORE_NAME, "readwrite")
					.objectStore(STORE_NAME)
					.put(theme);
			}
			resolve(theme?.css || null);
		};
		req.onerror = () => resolve(null);
	});
}

export function setupCodeTheme(dispatch: (action: any) => void) {
	hollow.pevents.on("post-realm", async () => {
		localDB = await initDatabase();
		const realmId = getCurrentRealm().id;
		const lastTheme =
			localStorage.getItem(getLastThemeKey(realmId)) || "default";
		dispatch({ domain: "code-theme", type: "set-theme", name: lastTheme });
	});
}

export async function codeThemeEffects(action: Events, state: CodeThemeState) {
	if (action.domain !== "code-theme") return;

	switch (action.type) {
		case "set-theme":
			if (localDB) {
				let css = await getCachedTheme(localDB, action.name);
				if (!css) {
					try {
						css = await fetchTheme(action.name);
						await saveTheme(localDB, action.name, css);
						await evictOldThemes(localDB);
					} catch (e) {
						console.error("Failed to load theme", e);
						return;
					}
				}
				applyTheme(css);

				const realmId = getCurrentRealm().id;
				if (realmId) {
					localStorage.setItem(getLastThemeKey(realmId), action.name);
				}
			}
			break;
	}
}
