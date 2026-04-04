import { RootState, Action } from "./types";
import { realmReducer } from "../managers/Realm";

// Helper to get value from path
function getValue(obj: any, path: string): any {
	return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

// Helper to set value at path (returns new object)
function setValue(obj: any, path: string, value: any): any {
	const keys = path.split(".");
	const lastKey = keys.pop()!;
	const result = { ...obj };
	let current = result;

	for (const key of keys) {
		current[key] = { ...current[key] };
		current = current[key];
	}

	current[lastKey] = value;
	return result;
}

export function rootReducer(
	state: RootState | undefined,
	action: Action,
	draftKey?: string,
): RootState {
	const base = state ?? ({} as RootState);

	// --- DRAFT CONTROL (MUST BE FIRST) ---
	if (action.type === "DRAFT_START") {
		if (!draftKey) return base;
		// DEEP CLONE to break reference identity.
		// This ensures the snapshot is independent of Solid's in-place proxy mutations.
		let data = getValue(base, action.path);

		if (action.select) {
			if (Array.isArray(data)) {
				data = data.find(
					(item) => item[action.select!.key] === action.select!.value,
				);
			}
		}

		return {
			...base,
			_drafts: {
				...base._drafts,
				[draftKey]: {
					path: action.path,
					data: { ...data },
					select: action.select,
				},
			},
		};
	}

	if (action.type === "DRAFT_CANCEL") {
		if (!draftKey) return base;
		const drafts = { ...base._drafts };
		const draft = drafts[draftKey];
		delete drafts[draftKey];

		if (!draft) return base;

		let restoredState = base;

		if (draft.select) {
			const list = getValue(base, draft.path);
			if (Array.isArray(list)) {
				const newList = list.map((item) =>
					item[draft.select!.key] === draft.select!.value
						? draft.data
						: item,
				);
				restoredState = setValue(base, draft.path, newList);
			}
		} else {
			restoredState = setValue(base, draft.path, draft.data);
		}

		return {
			...restoredState,
			_drafts: drafts,
		};
	}

	if (action.type === "DRAFT_COMMIT") {
		if (!draftKey) return base;
		const drafts = { ...base._drafts };
		delete drafts[draftKey];

		return {
			...base,
			_drafts: drafts,
		};
	}

	// --- NORMAL STATE COMPUTATION ---
	const nextSlices = {
		realm: realmReducer(base.realm, action as any),
	};

	return {
		...nextSlices,
		_drafts: base._drafts,
	};
}
