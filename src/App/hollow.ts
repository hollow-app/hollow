import { EventsManager } from "@managers/EventsManager";
import { AppEventReturns, AppEvents, HollowEvent } from "@type/hollow";
import { EventEmitter2 } from "eventemitter2";
type hollowType = {
	onCopy?: () => void;
	onCut?: () => void;
	onPaste?: () => void;
	coreTools: string[];
	events: HollowEvent<AppEvents, AppEventReturns>;
	pevents: EventEmitter2;
	// promises should accept future diff types
	promises: Map<
		string,
		{ resolve: () => void; id: string; close: () => void }
	>;
};
export const hollow: hollowType = {
	coreTools: ["image", "notebook", "kanban", "embed"],
	events: new EventsManager() as HollowEvent<AppEvents, AppEventReturns>,
	pevents: new EventEmitter2({}),
	promises: new Map<
		string,
		{ resolve: () => void; id: string; close: () => void }
	>(),
};
