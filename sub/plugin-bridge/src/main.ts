/**
 * Bridge logic for Hollow plugins.
 * This file handles communication between the plugin (iframe) and the host application.
 */

export { };

declare global {
    interface Window {
        __HOLLOW_ID__: string;
        __TYPE__: string;
        __API__: {
            app: Bridge;
            module: Bridge;
        };
    }
}

const hollowId = window.__HOLLOW_ID__;
const requests = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>();
const functions = new Map<string, Function>();
const listeners = new Map<string, Function>();
const eventSubs = new Map<string, Set<string>>();
const wildcardListeners = new Set<Function>();

/**
 * Prepares data for transmission by identifying and registering functions.
 * Functions are replaced with a reference that can be called back later.
 */
const marshall = (val: any, depth = 0): any => {
    if (depth > 15) return null;

    if (typeof val === "function") {
        const id = crypto.randomUUID();
        functions.set(id, val);
        return { __isFunc: true, id };
    }

    if (val && typeof val === "object") {
        if (Array.isArray(val)) {
            return val.map((item) => marshall(item, depth + 1));
        }

        const result: any = {};
        const keys = new Set<string>();
        let proto = val;
        // Traverse prototype chain to get all properties
        while (proto && proto !== Object.prototype) {
            Object.getOwnPropertyNames(proto).forEach((key) => keys.add(key));
            proto = Object.getPrototypeOf(proto);
        }

        for (const key of keys) {
            if (key === "constructor" || key.startsWith("__")) continue;
            try {
                result[key] = marshall(val[key], depth + 1);
            } catch {
                // Ignore errors for properties that can't be accessed
            }
        }
        return result;
    }

    return val;
};

/**
 * Reconstructs data received from the host, converting function references back into callable async functions.
 */
const unmarshall = (val: any): any => {
    if (val && typeof val === "object" && val.__isFunc) {
        return (...args: any[]) => {
            const requestId = crypto.randomUUID();
            return new Promise((resolve, reject) => {
                requests.set(requestId, { resolve, reject });
                sendMessage({
                    type: ":callFunc",
                    funcId: val.id,
                    args: marshall(args),
                    requestId,
                });
            });
        };
    }

    if (val && typeof val === "object") {
        if (Array.isArray(val)) {
            return val.map(unmarshall);
        }

        const result: any = {};
        for (const key in val) {
            result[key] = unmarshall(val[key]);
        }
        return result;
    }

    return val;
};

/**
 * Sends a message to the host application.
 */
function sendMessage(data: any) {
    window.parent.postMessage(
        {
            __hollow: true,
            __id: hollowId,
            ...data,
        },
        "*"
    );
}

// Handle incoming messages from the host
window.addEventListener("message", async (event) => {
    const data = event.data;
    if (!data || data.__hollow !== true) return;

    // Handle replies to requests made by the plugin
    if (data.replyTo && requests.has(data.replyTo)) {
        const req = requests.get(data.replyTo);
        if (req) {
            if (data.error) {
                req.reject(new Error(data.error));
            } else {
                req.resolve(unmarshall(data.result));
            }
            requests.delete(data.replyTo);
        }
        return;
    }

    // Handle event triggers from the host
    if (data.type === ":eventTrigger") {
        const subId = data.subId;
        const handler = listeners.get(subId);
        if (handler) {
            try {
                const result = await handler(unmarshall(data.payload));
                sendMessage({
                    type: ":reply",
                    replyTo: data.requestId,
                    result: marshall(result),
                });
            } catch (err: any) {
                sendMessage({
                    type: ":reply",
                    replyTo: data.requestId,
                    error: err.message || "Listener threw error",
                });
            }
        }
        return;
    }

    // Handle function calls from the host (callbacks)
    if (data.type === ":callFunc") {
        const func = functions.get(data.funcId);
        if (func) {
            try {
                const result = await func(...unmarshall(data.args));
                sendMessage({
                    type: ":reply",
                    replyTo: data.requestId,
                    result: marshall(result),
                });
            } catch (err: any) {
                sendMessage({
                    type: ":reply",
                    replyTo: data.requestId,
                    error: err.message || "Function call threw error",
                });
            }
        }
        return;
    }

    // Direct CSS variable updates for theme support
    if (data.type === "THEME_UPDATE") {
        Object.entries(data.vars as Record<string, string>).forEach(([key, val]) => {
            document.documentElement.style.setProperty(key, val);
        });
        return;
    }
});

class Bridge {
    constructor(private kind: "app" | "module") { }

    /**
     * Subscribes to an event from the host.
     */
    on(eventName: string, handler: Function) {
        if (eventName === "*") {
            wildcardListeners.add(handler);
            return;
        }

        const subId = crypto.randomUUID();
        listeners.set(subId, handler);

        if (!eventSubs.has(eventName)) {
            eventSubs.set(eventName, new Set());
        }
        eventSubs.get(eventName)!.add(subId);

        sendMessage({
            kind: this.kind,
            type: ":on",
            eventName,
            subId,
        });
    }

    /**
     * Unsubscribes from an event.
     */
    off(eventName: string, handler: Function) {
        if (eventName === "*") {
            wildcardListeners.delete(handler);
            return;
        }

        const subs = eventSubs.get(eventName);
        if (subs) {
            for (const subId of subs) {
                if (listeners.get(subId) === handler) {
                    listeners.delete(subId);
                    subs.delete(subId);
                    sendMessage({
                        type: ":off",
                        subId,
                    });
                    break;
                }
            }
        }
    }

    /**
     * Emits an event to the host.
     */
    emit(eventName: string, payload: any) {
        const requestId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            requests.set(requestId, { resolve, reject });
            sendMessage({
                kind: this.kind,
                type: ":emit",
                requestId,
                eventName,
                payload: marshall(payload),
            });
        });
    }

    emitAsync(eventName: string, payload: any) {
        return this.emit(eventName, payload);
    }

    /**
     * Requests data from the host.
     */
    async getData(eventName: string) {
        const requestId = crypto.randomUUID();
        return new Promise((resolve, reject) => {
            requests.set(requestId, { resolve, reject });
            sendMessage({
                kind: this.kind,
                type: ":getData",
                requestId,
                eventName,
            });
        });
    }
}
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});
window.__API__ = {
    app: new Bridge("app"),
    module: new Bridge("module"),
};

type Property = { [key: string]: string };

const updateStyle = (vars: Property) => {
    const el = document.documentElement;
    Object.entries(vars).forEach(([name, value]) => {
        el.style.setProperty(name, value);
    });
}

if (window.__TYPE__ === "ui") {
    window.__API__.app.on("style-update", (vars: Property) => {
        updateStyle(vars)
    });

    window.__API__.app.on("theme-update", (theme: string) => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    });

    (async () => {
        try {
            const style = (await window.__API__.app.getData("style-update")) as Property;
            updateStyle(style);
            const theme = (await window.__API__.app.getData("theme-update")) as string;
            const isDark = theme === "dark";
            document.documentElement.classList.toggle("dark", isDark);

        } catch (err) {
            console.error("Failed to fetch initial theme state:", err);
        }
    })();
}
