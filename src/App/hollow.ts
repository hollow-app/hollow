import { EventsManager } from "@managers/EventsManager";
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
	coreTools: string[];
	events: HollowEvent<AppEvents, AppEventReturns>;
	pevents: HollowEvent<PrivateEvents>;
	toolManager?: ToolManager;
	cards?: () => CardType[];
	setCards?: SetStoreFunction<CardType[]>;
	// promises should accept future diff types
	promises: Map<
		string,
		{ resolve: () => void; id: string; close: () => void }
	>;
};
export const hollow: hollowType = {
	coreTools: ["image", "notebook", "kanban", "embed"],
	events: new EventsManager() as HollowEvent<AppEvents, AppEventReturns>,
	pevents: new EventsManager() as HollowEvent<PrivateEvents>,
	promises: new Map<
		string,
		{ resolve: () => void; id: string; close: () => void }
	>(),
};

type PrivateEvents = {
	"deep-link": string[];
	"ui-set-character": (character: Character) => void;
	editor: { tool: string; cardId: string };
	"context-menu": boolean;
};
