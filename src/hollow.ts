import { EventsManager } from "@app/managers/EventsManager";
import {
	AppApi,
	AppEventReturns,
	AppEvents,
	HollowEvent,
} from "@app/type/hollow";
import { PrivateEvents } from "@app/type/PrivateEvents";
import { Realm } from "@app/type/Realm";
type hollowType = {
	onCopy?: () => void;
	onCut?: () => void;
	onPaste?: () => void;
	coreTools: string[];
	coreLayouts: string[];
	events: HollowEvent<AppEvents, AppEventReturns>;
	pevents: HollowEvent<PrivateEvents>;
	realm?: Realm;
	pause: {
		auth: boolean;
	};
	// promises should accept future diff types
};
export const hollow: hollowType = {
	coreTools: ["image", "notebook", "kanban", "embed"],
	coreLayouts: ["expand", "editor", "account", "notifications"],
	events: new EventsManager<AppEvents, AppEventReturns>(),
	pevents: new EventsManager<PrivateEvents>(),
	pause: {
		auth: false,
	},
};
