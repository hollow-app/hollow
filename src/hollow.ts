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
} from "@type/hollow";
import { createStore, SetStoreFunction } from "solid-js/store";

type hollowType = {
	onCopy?: () => void;
	onCut?: () => void;
	onPaste?: () => void;
	events: HollowEvent<AppEvents, AppEventReturns>;
	pevents: HollowEvent<PrivateEvents>;
	toolManager?: ToolManager;
	markdownManager?: MarkdownManager;
	hotkeysManager?: hotkeysManager;
	cards: () => CardType[];
	setCards: SetStoreFunction<CardType[]>;
};
const [cards, setCards] = createStore([]);
export const hollow: hollowType = {
	events: new EventsManager() as HollowEvent<AppEvents, AppEventReturns>,
	pevents: new EventsManager() as HollowEvent<PrivateEvents>,
	cards: () => cards,
	setCards,
	// toolmanager is assigned in init
};

type PrivateEvents = {
	"deep-link": string[];
	"ui-set-character": (character: Character) => void;
	editor: { tool: string; cardId: string };
};
