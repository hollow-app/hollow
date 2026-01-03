import { createSignal, createMemo, onMount, Accessor, Setter } from "solid-js";
import { createLayout, Layout } from "@utils/layout";
import { hollow } from "hollow";
import { manager } from "@managers/index";
import { GridStackOptions } from "gridstack";

export interface ContainerState {
    controller: Layout;
    isSettings: Accessor<boolean>;
    setSettings: Setter<boolean>;
    canvasConfigs: Accessor<GridStackOptions>;
    setCanvasConfigs: Setter<GridStackOptions>;
    isLiveEditor: Accessor<boolean>;
    anyExpanded: Accessor<boolean>;
    setAnyExpanded: Setter<boolean>;
}

export interface ContainerActions {
    showEditor: () => void;
}

export interface ContainerHook {
    state: ContainerState;
    actions: ContainerActions;
}

/**
 * Custom hook for Container state and logic
 * This runs within the component context, preserving SolidJS reactivity
 */
export const useContainer = (): ContainerHook => {
    // Initialize state
    const controller = createLayout();
    const settingsManager = manager.settings;
    const [anyExpanded, setAnyExpanded] = createSignal(false);
    const [isSettings, setSettings] = createSignal(false);
    const [canvasConfigs, setCanvasConfigs] = createSignal<GridStackOptions>({
        disableResize: true,
        disableDrag: true,
        float: true,
        column: settingsManager.getConfig("grid-size"),
        cellHeight:
            (window.innerHeight - 16 + settingsManager.getConfig("grid-gap")) /
            settingsManager.getConfig("grid-size"),
    });

    // Derived state
    const isLiveEditor = createMemo(() => !canvasConfigs().disableDrag);

    // Actions
    const showEditor = () => {
        controller.selectPanel("right", "editor");
    };

    // Effects - these now run in proper component context
    onMount(() => {
        hollow.pevents.on("editor", showEditor);
        manager.hotkeys.events["Toggle Notifications"] = () =>
            controller.selectPanel("right", "notifications");
        manager.hotkeys.events["Toggle Expand"] = () =>
            controller.selectPanel("left", "expand");
        manager.hotkeys.events["Toggle Settings"] = () =>
            setSettings((p) => !p);
        manager.hotkeys.events["Toggle Editor"] = () => {
            controller.selectPanel("right", "editor");
        };
    });

    return {
        state: {
            controller,
            isSettings,
            setSettings,
            canvasConfigs,
            setCanvasConfigs,
            isLiveEditor,
            anyExpanded,
            setAnyExpanded,
        },
        actions: {
            showEditor,
        },
    };
};
