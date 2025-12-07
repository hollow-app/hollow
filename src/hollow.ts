import { EventsManager } from "@managers/EventsManager";
import { hotkeysManager } from "@managers/HotkeysManager";
import { MarkdownManager } from "@managers/MarkdownManager";
import { ToolManager } from "@managers/ToolManager";
import { Character } from "@type/Character";
import {
	AppEventReturns,
	AppEvents,
	CardType,
	HollowEvent,
	Layout,
} from "@type/hollow";
import { createStore, SetStoreFunction } from "solid-js/store";
type hollowType = {
	onCopy?: () => void;
	onCut?: () => void;
	onPaste?: () => void;
	coreTools: string[];
	events: HollowEvent<AppEvents, AppEventReturns>;
	pevents: HollowEvent<PrivateEvents>;
	toolManager?: ToolManager;
	markdownManager?: MarkdownManager;
	hotkeysManager?: hotkeysManager;
	cards: () => CardType[];
	setCards: SetStoreFunction<CardType[]>;
	promises: Map<string, { resolve: () => void; id: string }>;
};
const [cards, setCards] = createStore([]);
export const hollow: hollowType = {
	coreTools: ["image", "notebook", "kanban", "embed"],
	events: new EventsManager() as HollowEvent<AppEvents, AppEventReturns>,
	pevents: new EventsManager() as HollowEvent<PrivateEvents>,
	cards: () => cards,
	setCards,
	promises: new Map<string, { resolve: () => void; id: string }>(),
	// toolmanager is assigned in init
};

type PrivateEvents = {
	"deep-link": string[];
	"ui-set-character": (character: Character) => void;
	editor: { tool: string; cardId: string };
};
