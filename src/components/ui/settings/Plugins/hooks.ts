import { createSignal, createResource, Accessor, Setter, Resource } from "solid-js";
import { hollow } from "hollow";
import { manager } from "@managers/index";

export interface PluginType {
    name: string;
    desc: string;
    version: string;
    repo: string;
    author: string;
    verified: boolean;
    verificationDate: string;
    installed?: boolean;
    action_state?: "install" | "update" | "uninstall";
    icon?: string;
}

export interface PluginsProps { }

export interface PluginsState {
    unverified: Accessor<boolean>;
    checkUnverified: Setter<boolean>;
    selectedPlugin: Accessor<PluginType | null>;
    setSelectedPlugin: Setter<PluginType | null>;
    selectedMD: Accessor<string | null>;
    setSelectedMD: Setter<string | null>;
    plugins: Resource<PluginType[]>;
}

export interface PluginsActions {
    switchUnverified: (e: Event) => void;
    action: (e: Event & { currentTarget: HTMLButtonElement }) => Promise<void>;
}

export interface PluginsHook {
    state: PluginsState;
    actions: PluginsActions;
}

export const usePlugins = (): PluginsHook => {
    const [unverified, checkUnverified] = createSignal(false);
    const [selectedPlugin, setSelectedPlugin] = createSignal<PluginType | null>(null);
    const [selectedMD, setSelectedMD] = createSignal<string | null>(null);

    const [plugins] = createResource<PluginType[]>(async () => {
        const response = await fetch(
            "https://raw.githubusercontent.com/hollow-app/hollow-registry/refs/heads/main/plugins.json",
        );
        return await response.json();
    });

    const action = async (e: Event & { currentTarget: HTMLButtonElement }) => {
        const el = e.currentTarget;
        const plugin = selectedPlugin();
        if (!plugin) return;

        const name = plugin.name;
        const icon = plugin.icon;
        const actionState = plugin.action_state;
        const vm = manager.vault;

        const delay = () => new Promise((r) => setTimeout(r, 2000));
        const removeIcon = async () => {
            const item = vm.getVault().find((i) => i.url === icon);
            item && (await vm.removeItems([item.path]));
        };

        setSelectedPlugin((p) => (p ? { ...p, installed: undefined } : null));

        if (actionState === "uninstall") {
            el.classList.add("debounce");

            const closeAlert = hollow.events.emit("alert", {
                message: `Uninstalling ${name}`,
                type: "loading",
            });

            const success = await hollow.toolManager.uninstallTool(
                name.toLowerCase(),
            );

            await delay();
            el.classList.remove("debounce");
            await removeIcon();
            closeAlert();

            if (success) {
                setSelectedPlugin((p) => (p ? {
                    ...p,
                    installed: false,
                    action_state: "install",
                } : null));
            }

            return;
        }

        const isUpdate = actionState === "update";

        if (isUpdate) {
            const confirmed = await new Promise<boolean>((resolve) => {
                hollow.events.emit("confirm", {
                    title: "Warning",
                    message:
                        "Updating a plugin will require you to reload the app\nContinue ?",
                    onAccept: () => resolve(true),
                    onRefuse: () => resolve(false),
                });
            });

            if (!confirmed) return;

            await removeIcon();
        }

        el.classList.add("debounce");

        const closeAlert = hollow.events.emit("alert", {
            message: `${isUpdate ? "Updating" : "Installing"} ${name}`,
            type: "loading",
        });

        const success = await hollow.toolManager.installTool(
            name.toLowerCase(),
            plugin.repo,
            isUpdate,
        );

        await delay();
        el.classList.remove("debounce");
        closeAlert();

        if (success) {
            setSelectedPlugin((p) => (p ? {
                ...p,
                installed: true,
                action_state: "uninstall",
            } : null));
        }
    };

    const switchUnverified = (e: Event) => {
        if (!unverified()) {
            e.preventDefault();
            hollow.events.emit("confirm", {
                title: "warning",
                message:
                    "Installing unverified plugins may pose security risks.\nOnly install plugins that you trust and are sure are safe.",
                onAccept: () => {
                    checkUnverified(true);
                },
            });
        } else {
            checkUnverified(false);
        }
    };

    return {
        state: {
            unverified,
            checkUnverified,
            selectedPlugin,
            setSelectedPlugin,
            selectedMD,
            setSelectedMD,
            plugins,
        },
        actions: {
            switchUnverified,
            action,
        },
    };
};
