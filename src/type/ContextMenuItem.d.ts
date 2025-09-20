export type ContextMenuItem = {
        id: string;
        header: string;
        items: Item[];
};

type Item = {
        icon: string;
        label: string;
        onclick?: () => void;
        children?: Item[];
};
