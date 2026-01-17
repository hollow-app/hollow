import { createStore, reconcile } from "solid-js/store";
import { createContext, useContext, JSX, onMount } from "solid-js";
import { RootState, Action } from "./types";
import { rootReducer } from "./reducer";
import { runEffects, setupEffects } from "./effects";

// Create Context
const StoreContext = createContext<{
	state: RootState;
	dispatch: (action: Action) => Promise<void>;
}>();

export function StoreProvider(props: { children: JSX.Element }) {
	// Initialize state using reducer with undefined state to get defaults
	const initialState = rootReducer(undefined, {} as Action);

	const [state, setState] = createStore<RootState>(initialState);

	function dispatch(action: Action): Promise<void> {
		// Pure state update
		const newState = rootReducer(state, action);

		// We update the store.
		setState(reconcile(newState));

		// Side effects
		const result: any = runEffects(action, newState);
		return result instanceof Promise ? result : Promise.resolve();
	}

	// Setup global listeners
	onMount(() => {
		setupEffects(dispatch);
	});

	return (
		<StoreContext.Provider value={{ state, dispatch }}>
			{props.children}
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
