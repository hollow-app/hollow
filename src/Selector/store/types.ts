import { Events as RealmEvents, RealmState } from "../managers/Realm";

// Root State
export interface RootState {
	realm: RealmState;
	_drafts?: Record<
		string,
		{ path: string; data: any; select?: { key: string; value: any } }
	>;
}

export type Action =
	| RealmEvents
	| {
			type: "DRAFT_START";
			path: string;
			select?: { key: string; value: any };
	  }
	| { type: "DRAFT_COMMIT" }
	| { type: "DRAFT_CANCEL" };

export type DispatchOptions = {
	runEffects?: boolean;
	draft?: string;
};

// external
type Path<T> = T extends object
	? {
			[K in keyof T & string]: K | `${K}.${Path<T[K]>}`;
		}[keyof T & string]
	: never;

export function usePath<T>() {
	return <P extends Path<T>>(p: P) => p;
}
// internal
export const storePath = usePath<RootState>();
