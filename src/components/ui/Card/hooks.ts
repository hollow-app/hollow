import { createSignal, createEffect, on, onMount, onCleanup, Accessor, Setter } from "solid-js";
import { GridStack } from "gridstack";
import { CardType } from "@type/hollow";
import { hollow } from "hollow";
import { ExpandIcon } from "lucide-solid";
import { MyIconFun } from "@components/MyIcon";
import { ContextMenuItem } from "@type/hollow";

export interface CardProps {
    node: CardType;
    grid: GridStack;
    isLiveEditor: Accessor<boolean>;
    setAnyExpaneded: Setter<boolean>;
}

export interface CardState {
    el: Accessor<HTMLDivElement | undefined>;
    setEl: (el: HTMLDivElement) => void;
    isLoaded: Accessor<boolean>;
    setLoaded: Setter<boolean>;
    isExpand: Accessor<boolean>;
    setExpand: Setter<boolean>;
}

export interface CardActions {
    onContextMenu: () => void;
}

export interface CardHook {
    state: CardState;
    actions: CardActions;
}

export const useCard = (props: CardProps): CardHook => {
    const [el, setElSignal] = createSignal<HTMLDivElement>();
    const [isLoaded, setLoaded] = createSignal(false);
    const [isExpand, setExpand] = createSignal(false);

    const tool = props.node.data.tool;

    createEffect(
        on(
            () => [props.node.w, props.node.x, props.node.h, props.node.y],
            () => {
                const element = el();
                if (element && !props.isLiveEditor()) {
                    props.grid.update(element, props.node);
                }
            },
            { defer: true },
        ),
    );

    createEffect(() => {
        const element = el();
        if (element && props.grid && props.node.data.isPlaced) {
            props.grid.makeWidget(element);
        }
    });

    const showEditor = () => {
        hollow.pevents.emit("editor", {
            tool: tool,
            cardId: props.node.id,
        });
        hollow.events.emit("context-menu", false);
    };

    const showSettings = () => {
        hollow.toolManager
            .getToolEvents(tool)
            .emit(`${props.node.id}-settings`, true);
        hollow.events.emit("context-menu", false);
    };

    const expand = () => {
        hollow.toolManager
            .getToolEvents(tool)
            .toggle(`${props.node.id}-expand`);
    };

    const onContextMenu = () => {
        const cmItems: ContextMenuItem = {
            id: `vault`,
            header: "Card",
            items: [
                {
                    icon: ExpandIcon,
                    label: "Focus Mode",
                    onclick: () => expand(),
                },
                {
                    icon: MyIconFun({ name: "designtools-outline" }),
                    label: "Modify",
                    onclick: showEditor,
                },
                {
                    icon: MyIconFun({ name: "gear-outline" }),
                    label: "Configure",
                    onclick: showSettings,
                },
            ],
        };
        hollow.events.emit("context-menu-extend", cmItems);
    };

    const toggleExpand = (v: boolean) => {
        setExpand(v);
        props.setAnyExpaneded(v);
    };

    onMount(async () => {
        const result = await hollow.toolManager.loadCard(props.node, tool);
        setLoaded(result.status);
        if (!result.status) {
            console.error(result);
        }
        hollow.toolManager
            .getToolEvents(tool)
            .on(`${props.node.id}-expand`, toggleExpand);
    });

    onCleanup(() => {
        const element = el();
        if (element) {
            props.grid?.removeWidget(element, false);
        }
        hollow.toolManager
            .getToolEvents(tool)
            .off(`${props.node.id}-expand`, toggleExpand);
    });

    return {
        state: {
            el,
            setEl: setElSignal,
            isLoaded,
            setLoaded,
            isExpand,
            setExpand,
        },
        actions: {
            onContextMenu,
        },
    };
};
