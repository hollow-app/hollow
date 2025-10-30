import { EntryManager } from "@managers/EntryManager";
import { EventsManager } from "@managers/EventsManager";
import { hotkeysManager } from "@managers/HotkeysManager";
import { MarkdownManager } from "@managers/MarkdownManager";
import { ToolManager } from "@managers/ToolManager";
import { AppEvents, HollowEvent } from "@type/hollow";

type hollowType = {
	canvas_size?: { w: number; h: number };
	canvas_grid?: { cw: number; rh: number };
	onCopy?: () => void;
	onCut?: () => void;
	onPaste?: () => void;
	events: HollowEvent<AppEvents>;
	pevents: HollowEvent<PrivateEvents>;
	toolManager?: ToolManager;
	entryManager?: EntryManager;
	markdownManager?: MarkdownManager;
	hotkeysManager?: hotkeysManager;
};

export const hollow: hollowType = {
	events: new EventsManager() as HollowEvent<AppEvents>,
	pevents: new EventsManager() as HollowEvent<PrivateEvents>,
	// toolmanager is assigned in init
};

type PrivateEvents = {
	"deep-link": string[];
};
