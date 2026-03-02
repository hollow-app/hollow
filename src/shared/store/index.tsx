import { createStore, reconcile, unwrap } from "solid-js/store";
import {
	createContext,
	useContext,
	JSX,
	onMount,
	createSignal,
	Show,
} from "solid-js";
import { RootState, Action, DispatchOptions } from "./types";
import { rootReducer } from "./reducer";
import { runEffects as Effects, setupEffects } from "./effects";

// Create Context
const StoreContext = createContext<{
	state: RootState;
	dispatch: (action: Action, options?: DispatchOptions) => Promise<any>;
}>();

export function StoreProvider(props: { children: JSX.Element }) {
	const [isSetupDone, setSetupDone] = createSignal(false);
	// Initialize state using reducer with undefined state to get defaults
	const initialState = rootReducer(undefined, {} as Action);

	const [state, setState] = createStore<RootState>(initialState);

	// Queue for draft effects
	const draftQueues = new Map<string, Action[]>();
	function drafter(
		action: Action,
		options: DispatchOptions,
		newState: RootState,
	) {
		const { draft } = options;
		// Handle Draft Commit/Cancel
		if (draft && action.type === "DRAFT_COMMIT") {
			const queue = draftQueues.get(draft) || [];
			draftQueues.delete(draft);
			// Run all queued effects
			const promises = queue.map((a) => Effects(a, newState));
			return Promise.all(promises).then(() => void 0);
		}

		if (draft && action.type === "DRAFT_CANCEL") {
			draftQueues.delete(draft);
			return Promise.resolve();
		}

		// Queue effects if in draft mode
		if (draft) {
			const queue = draftQueues.get(draft) || [];
			queue.push(action);
			draftQueues.set(draft, queue);
			return Promise.resolve();
		}
	}

	function dispatch(
		action: Action,
		options: DispatchOptions = {},
	): Promise<void> {
		const { runEffects = true, draft } = options;
		// Pure state update - unwrap to prevent proxy mutations in drafts
		const newState = rootReducer(unwrap(state), action, draft);

		// We update the store.
		setState(reconcile(newState));

		// Draft
		const draftPromise = drafter(action, options, newState);

		// Side effects - Only run if not drafting or if explicitly requested without a draft
		if (runEffects && !draft) {
			const result: any = Effects(action, newState);
			return result instanceof Promise ? result : Promise.resolve();
		}
		return draftPromise ?? Promise.resolve();
	}

	// Setup global listeners
	onMount(async () => {
		await setupEffects(dispatch, () => unwrap(state));
		setSetupDone(true);
	});

	return (
		<StoreContext.Provider value={{ state, dispatch }}>
			<Show when={isSetupDone()}>{props.children}</Show>
		</StoreContext.Provider>
	);
}

export function useStore() {
	const context = useContext(StoreContext);
	if (!context) {
		throw new Error("useStore must be used within a StoreProvider");
	}
	return context;
}
