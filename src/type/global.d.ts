import { EntryManager } from "@managers/EntryManager";
import { HollowManager } from "@managers/HollowManager";
import { hotkeysManager } from "@managers/HotkeysManager";
import { MarkdownManager } from "@managers/MarkdownManager";
import { RealmManager } from "@managers/RealmManager";
import { ToolManager } from "@managers/ToolManager";
import { AppEvents, DataBase, HollowEvent } from "@type/hollow";
import { Setter } from "solid-js";
import { EditorKitType } from "./EditorKitType";

export {};

declare global {
	interface Window {
		canvas_size: { w: number; h: number };
		canvas_grid: { cw: number; rh: number };
		onCopy: () => void;
		onCut: () => void;
		onPaste: () => void;
		hollowManager: HollowManager<AppEvents>;
		realmManager: RealmManager;
		toolManager: ToolManager;
		entryManager: EntryManager;
		// editorKit: Setter<KitEditorType>;
		markdownManager: MarkdownManager;
		hotkeysManager: hotkeysManager;
		// setEditor: (b: boolean) => void;
	}
}
