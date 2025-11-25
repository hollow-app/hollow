import { EntryManager } from "@managers/EntryManager";
import { EventsManager } from "@managers/EventsManager";
import { hotkeysManager } from "@managers/HotkeysManager";
import { MarkdownManager } from "@managers/MarkdownManager";
import { ToolManager } from "@managers/ToolManager";
import { Character } from "@type/Character";
import { AppEventReturns, AppEvents, HollowEvent } from "@type/hollow";
import { Opthand } from "@type/Opthand";
import { createStore, SetStoreFunction } from "solid-js/store";

type GroupType = Record<string, Opthand>;
type hollowType = {
	onCopy?: () => void;
	onCut?: () => void;
	onPaste?: () => void;
	events: HollowEvent<AppEvents, AppEventReturns>;
	pevents: HollowEvent<PrivateEvents>;
	toolManager?: ToolManager;
	entryManager?: EntryManager;
	markdownManager?: MarkdownManager;
	hotkeysManager?: hotkeysManager;
	group: () => GroupType;
	setGroup: SetStoreFunction<GroupType>;
};
const [group, setGroup] = createStore({});
export const hollow: hollowType = {
	events: new EventsManager() as HollowEvent<AppEvents, AppEventReturns>,
	pevents: new EventsManager() as HollowEvent<PrivateEvents>,
	group: () => group,
	setGroup,
	// toolmanager is assigned in init
};

type PrivateEvents = {
	"deep-link": string[];
	"ui-set-character": (character: Character) => void;
	editor: { tool: string; cardId: string };
};
