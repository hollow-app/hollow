import { hollow } from "hollow";
import { Accessor, createSignal, ParentComponent, Setter } from "solid-js";
import { useContext } from "solid-js";
import { createContext } from "solid-js";
import { onMount, onCleanup } from "solid-js";

interface TurnstileType {
	token: Accessor<string>;
	setToken: Setter<string>;
	widgetId: Accessor<any>;
	setWidgetId: Setter<any>;
	clean: () => void;
	execute: () => void;
	reset: () => void;
}
const TurnstileContext = createContext<TurnstileType>();

interface TurnstileProps {
	// onReady?: (widgetId: any, getResponse: () => string) => void;
}

export function Turnstile(props: TurnstileProps) {
	let widgetId: any;
	const turn = useTurnstile();

	onMount(() => {
		if (hollow.pause.auth) return;
		widgetId = (window as any).turnstile.render("#turnstile-container", {
			sitekey: "0x4AAAAAACJ-K1ZYUxXLMA3L",
			theme: localStorage.theme ?? "light",
			size: "normal",
			appearance: "always",
			callback: (token: any) => {
				turn.setToken(token);
			},
			"error-callback": (some: any) => {
				console.log("Error:", some);
			},
		});
		turn.setWidgetId(widgetId);
		onCleanup(() => {
			(window as any).turnstile.remove(widgetId);
		});
	});
	if (hollow.pause.auth) {
		return <div />;
	}

	return (
		<div
			class="cf-turnstile flex items-center justify-center"
			id="turnstile-container"
		></div>
	);
}
export const TurnstileProvider: ParentComponent = (props) => {
	const [token, setToken] = createSignal("");
	const [widgetId, setWidgetId] = createSignal<any>(null);
	const execute = () => {
		(window as any).turnstile.execute();
	};
	const reset = () => {
		if (!widgetId()) return;
		(window as any).turnstile.reset(widgetId());
	};
	const clean = () => {
		setToken("");
		setWidgetId(null);
	};
	const value: TurnstileType = {
		token,
		setToken,
		widgetId,
		setWidgetId,
		clean,
		execute,
		reset,
	};
	return (
		<TurnstileContext.Provider value={value}>
			{props.children}
		</TurnstileContext.Provider>
	);
};

export function useTurnstile() {
	const context = useContext(TurnstileContext);
	if (!context) {
		throw new Error("useTurnstile must be used within a TurnstileProvider");
	}
	return context;
}
