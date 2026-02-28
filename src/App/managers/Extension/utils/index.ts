import { ToolApi } from "@app/type/hollow";
import { hollow } from "hollow";

export function buildPluginIframe(module: ToolApi) {
	const app = hollow.events;
	const id = crypto.randomUUID();
	//
	const iframe = document.createElement("iframe");
	iframe.sandbox.add("allow-scripts");
	iframe.style.width = "100%";
	iframe.style.height = "100%";
	iframe.srcdoc = buildPluginHTML(id);
	return iframe;
}
export function buildPluginHTML(id: string) {
	return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
</head>
<body>
<div id="root"></div>

<script>
(() => {

const pending = new Map();
const listeners = new Map();
const wildcard = new Set();
const currentData = new Map();


function generateId() {
	return ${id};
}

function send(message) {
	parent.postMessage(
		{
			__hollow: true,
			__domain: "plugin",
			__id: ${id},
			...message,
		},
		"*",
	);
}

window.addEventListener("message", (event) => {
	const data = event.data;
	if (!data || data.__hollow !== true) return;
	// async replies
	if (data.replyTo && pending.has(data.replyTo)) {
		pending.get(data.replyTo)(data.result);
		pending.delete(data.replyTo);
		return;
	}
	// pushed event from parent
	if (data.push && data.eventName) {
		currentData.set(data.eventName, data.payload);

		if (listeners.has(data.eventName)) {
			for (const fn of listeners.get(data.eventName)) {
				fn(data.payload);
			}
		}

		for (const fn of wildcard) {
			fn({ event: data.eventName, data: data.payload });
		}
	}
});

class HollowEventBridge {
	kind;
	constructor(kind) {
		this.kind = kind;
	}
	on(eventName, listener) {
		if (eventName === "*") {
			wildcard.add(listener);
			return;
		}

		if (!listeners.has(eventName)) {
			listeners.set(eventName, new Set());
			send({ kind: this.kind, type: ":on", eventName });
		}

		listeners.get(eventName).add(listener);
	}

	off(eventName, listener) {
		if (eventName === "*") {
			wildcard.delete(listener);
			return;
		}

		if (!listeners.has(eventName)) return;

		const set = listeners.get(eventName);
		set.delete(listener);

		if (set.size === 0) {
			listeners.delete(eventName);
			send({ kind: this.kind, type: ":off", eventName });
		}
	}

	emit(eventName, payload) {
		const id = generateId();

		return new Promise((resolve) => {
			pending.set(id, resolve);
			send({ kind: this.kind, type: ":emit", id, eventName, payload });
		});
	}

	emitAsync(eventName, payload) {
		return this.emit(eventName, payload);
	}

	async getData(eventName) {
		// Ask parent for authoritative value
		const id = generateId();

		return new Promise((resolve) => {
			pending.set(id, resolve);
			send({ kind: this.kind, type: ":getData", id, eventName });
		});
	}

	async clear(eventName) {
		listeners.delete(eventName);
		send({ kind: this.kind, type: ":clear", eventName });
	}

	async toggle(eventName) {
		const id = generateId();

		return new Promise((resolve) => {
			pending.set(id, resolve);
			send({ kind: this.kind, type: ":toggle", id, eventName });
		});
	}
}

const hollow = {
	app: new HollowEventBridge("app"),
	module: new HollowEventBridge("module"),
};

Object.freeze(hollow);
Object.freeze(hollow.app);
Object.freeze(hollow.module);

window.__API__ = hollow;
})();

</script>

</body>
</html>
`;
}
