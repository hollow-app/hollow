import { ToolApi } from "@app/type/hollow";
import { hollow } from "hollow";
import pluginHtml from "../../../../../sub/plugin-bridge/dist/index.html?raw";

/**
 * Bridges communication between the host and plugin iframes.
 * Handles function marshalling, async returns, and event synchronization.
 */
export function buildPluginIframe({
	module,
	script,
	visual = true,
	additionalData,
}: {
	module: ToolApi;
	script: string;
	visual?: boolean;
	additionalData?: [string, { [key: string]: string }][];
}) {
	const app = hollow.events;
	const id = crypto.randomUUID();

	const iframe = document.createElement("iframe");
	iframe.sandbox.add("allow-scripts");
	iframe.style.width = "100%";
	iframe.style.height = "100%";
	iframe.srcdoc = buildPluginHTML(id, script, additionalData);
	if (!visual) {
		iframe.style.display = "none";
		document.body.appendChild(iframe);
	}

	const functionRegistry = new Map<string, Function>();
	const pendingRequests = new Map<
		string,
		{ resolve: (res: any) => void; reject: (err: any) => void }
	>();

	const marshall = (val: any, depth = 0): any => {
		if (depth > 5) return null; // Prevent deep recursion
		if (typeof val === "function") {
			const funcId = crypto.randomUUID();
			functionRegistry.set(funcId, val);
			return { __isFunc: true, id: funcId };
		}
		if (val && typeof val === "object") {
			if (Array.isArray(val))
				return val.map((i) => marshall(i, depth + 1));
			const newObj: any = {};

			// Collect all properties including from prototype (for classes like IStore)
			const keys = new Set<string>();
			let proto = val;
			while (proto && proto !== Object.prototype) {
				Object.getOwnPropertyNames(proto).forEach((k) => keys.add(k));
				proto = Object.getPrototypeOf(proto);
			}

			for (const key of keys) {
				if (key === "constructor" || key.startsWith("__")) continue;
				try {
					newObj[key] = marshall(val[key], depth + 1);
				} catch (e) {
					// Skip non-accessible properties
				}
			}
			return newObj;
		}
		return val;
	};

	const unmarshall = (val: any): any => {
		if (val && typeof val === "object" && val.__isFunc) {
			return (...args: any[]) => {
				const requestId = crypto.randomUUID();
				return new Promise((resolve, reject) => {
					pendingRequests.set(requestId, { resolve, reject });
					iframe.contentWindow?.postMessage(
						{
							__hollow: true,
							type: ":callFunc",
							funcId: val.id,
							args: marshall(args),
							requestId,
						},
						"*",
					);
				});
			};
		}
		if (val && typeof val === "object") {
			if (Array.isArray(val)) return val.map(unmarshall);
			const newObj: any = {};
			for (const key in val) {
				newObj[key] = unmarshall(val[key]);
			}
			return newObj;
		}
		return val;
	};

	// subId -> real listener function on host
	const eventSubscribers = new Map<
		string,
		{ eventName: string; listener: (payload: any) => any; kind: string }
	>();

	const handleMessage = async (event: MessageEvent) => {
		const data = event.data;
		// Security: Validate source
		if (event.source !== iframe.contentWindow) return;
		if (!data || data.__hollow !== true || data.__id !== id) return;

		switch (data.type) {
			case ":on": {
				const { eventName, subId, kind } = data;
				if (eventSubscribers.has(subId)) return;

				const target = kind === "app" ? app : module;
				const listener = async (payload: any) => {
					return new Promise((resolve, reject) => {
						const requestId = crypto.randomUUID();
						pendingRequests.set(requestId, { resolve, reject });
						iframe.contentWindow?.postMessage(
							{
								__hollow: true,
								type: ":eventTrigger",
								subId,
								eventName,
								kind,
								payload: marshall(payload),
								requestId,
							},
							"*",
						);
					});
				};

				eventSubscribers.set(subId, { eventName, listener, kind });
				target.on(eventName, listener);
				break;
			}

			case ":off": {
				const { subId } = data;
				const sub = eventSubscribers.get(subId);
				if (sub) {
					const target = sub.kind === "app" ? app : module;
					target.off(sub.eventName, sub.listener);
					eventSubscribers.delete(subId);
				}
				break;
			}

			case ":emit":
			case ":emitAsync": {
				const target = data.kind === "app" ? app : module;
				try {
					const result = await target.emitAsync(
						data.eventName,
						unmarshall(data.payload),
					);
					iframe.contentWindow?.postMessage(
						{
							__hollow: true,
							replyTo: data.requestId,
							result: marshall(result),
						},
						"*",
					);
				} catch (error: any) {
					iframe.contentWindow?.postMessage(
						{
							__hollow: true,
							replyTo: data.requestId,
							error: error.message || "Unknown error during emit",
						},
						"*",
					);
				}
				break;
			}

			case ":getData": {
				const target = data.kind === "app" ? app : module;
				const result = target.getData(data.eventName);
				iframe.contentWindow?.postMessage(
					{
						__hollow: true,
						replyTo: data.requestId,
						result: marshall(result),
					},
					"*",
				);
				break;
			}

			case ":callFunc": {
				const func = functionRegistry.get(data.funcId);
				if (func) {
					try {
						const result = await func(...unmarshall(data.args));
						iframe.contentWindow?.postMessage(
							{
								__hollow: true,
								replyTo: data.requestId,
								result: marshall(result),
							},
							"*",
						);
					} catch (error: any) {
						iframe.contentWindow?.postMessage(
							{
								__hollow: true,
								replyTo: data.requestId,
								error:
									error.message ||
									"Unknown error during function call",
							},
							"*",
						);
					}
				}
				break;
			}

			case ":reply": {
				const pending = pendingRequests.get(data.replyTo);
				if (pending) {
					if (data.error) {
						pending.reject(new Error(data.error));
					} else {
						pending.resolve(unmarshall(data.result));
					}
					pendingRequests.delete(data.replyTo);
				}
				break;
			}
		}
	};

	window.addEventListener("message", handleMessage);

	// Robust Cleanup Mechanism
	const cleanup = () => {
		window.removeEventListener("message", handleMessage);
		eventSubscribers.forEach((sub) => {
			const target = sub.kind === "app" ? app : module;
			target.off(sub.eventName, sub.listener);
		});
		eventSubscribers.clear();
		pendingRequests.forEach((p) => p.reject(new Error("Iframe destroyed")));
		pendingRequests.clear();
		functionRegistry.clear();
	};

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			for (const node of Array.from(mutation.removedNodes)) {
				if (
					node === iframe ||
					(node instanceof HTMLElement && node.contains(iframe))
				) {
					cleanup();
					observer.disconnect();
					return;
				}
			}
		}
	});

	// Observe body as the iframe might be nested and parentElement is not yet available
	observer.observe(document.body, { childList: true, subtree: true });

	return iframe;
}

export function buildPluginHTML(
	id: string,
	script: string,
	additionalData?: [string, { [key: string]: string }][],
) {
	const dataScripts = (additionalData ?? [])
		.map(([name, obj]) => {
			const safeName = String(name).replace(/[^\w$]/g, "");
			return `window.__${safeName}__ = ${JSON.stringify(obj ?? {})};`;
		})
		.join("\n");

	const injection = `
<script>
    window.__HOLLOW_ID__ = "${id}";
    ${dataScripts}
</script>
`;

	let html = pluginHtml.replace("<head>", `<head>${injection}`);
	if (script) {
		html = html.replace(
			"</body>",
			`<script type="module">${script}</script></body>`,
		);
	}
	return html;
}
