import { Component } from "solid-js";

export type PanelType = "left" | "right";

export interface SideLayout {
    visible: boolean;
    current?: string;
    panels: string[];
}

export interface LayoutState {
    left: SideLayout;
    right: SideLayout;
}

export type LayoutEvents = { domain: "layout" } & (
    | {
        type: "add-panel";
        side: PanelType;
        id: string;
    }
    | {
        type: "remove-panel";
        side: PanelType;
        id: string;
    }
    | {
        type: "select-panel";
        side: PanelType;
        id: string;
    }
    | {
        type: "toggle-panel";
        side: PanelType;
    }
    | {
        type: "set-visibility";
        side: PanelType;
        visible: boolean;
    }
);
