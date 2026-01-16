import { Events as RealmEvents, RealmState } from "../managers/Realm";
// Root State
export interface RootState {
	realm: RealmState;
}

// Actions

// We need to define ContextEvents. Currently they might be mixed or not defined explicitly as a union.
// I'll define a placeholder for now or try to find them.
// In HollowContext.tsx, there are setters but no explicit "events" for context state updates in the old architecture?
// Wait, HollowContext just exposed setters: setTags, setFocus, setCards.
// So I need to CREATE actions for Context domain.

export type Action = RealmEvents;
