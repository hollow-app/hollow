import { EventsManager } from "@app/managers/EventsManager";
import {
	AppApi,
	AppEventReturns,
	AppEvents,
	HollowEvent,
} from "@app/type/hollow";
import { PrivateEvents } from "@app/type/PrivateEvents";
type hollowType = {
	onCopy?: () => void;
	onCut?: () => void;
	onPaste?: () => void;
	coreTools: string[];
	events: HollowEvent<AppEvents, AppEventReturns>;
	pevents: HollowEvent<PrivateEvents>;
	// promises should accept future diff types
};
export const hollow: hollowType = {
	coreTools: ["image", "notebook", "kanban", "embed"],
	events: new EventsManager<AppEvents, AppEventReturns>(),
	pevents: new EventsManager<PrivateEvents>(),
};
