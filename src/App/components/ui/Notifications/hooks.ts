import { createSignal, onMount, onCleanup, Accessor, Setter } from "solid-js";
import { manager } from "@managers/index";
import { NotifyType } from "@type/NotifyType";

export interface NotificationsProps {
    hide: () => void;
}

export interface NotificationsState {
    notifications: Accessor<NotifyType[]>;
    setNotifications: Setter<NotifyType[]>;
}

export interface NotificationsActions {
    removeNoty: (id: string) => void;
    clearAll: () => void;
}

export interface NotificationsHook {
    state: NotificationsState;
    actions: NotificationsActions;
}

export const useNotifications = (props: NotificationsProps): NotificationsHook => {
    const [notifications, setNotifications] = createSignal<NotifyType[]>([]);

    onMount(() => {
        const unsub = manager.notify.subscribe(
            (n) => {
                setNotifications([...n]);
            },
            { key: "notifications", now: true },
        );
        onCleanup(() => {
            unsub;
        });
    });

    const removeNoty = (id: string) => {
        setNotifications((prev) => [...prev.filter((i) => i.id !== id)]);
        manager.notify.removeNoty(id);
    };

    const clearAll = () => {
        props.hide();
        setNotifications([]);
        manager.notify.clearAll();
    };

    return {
        state: {
            notifications,
            setNotifications,
        },
        actions: {
            removeNoty,
            clearAll,
        },
    };
};
