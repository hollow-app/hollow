import { Events, NotificationsState } from "./type";

const defaultState: NotificationsState = {
    notifications: [],
    alert: false,
};

export function notificationsReducer(
    state: NotificationsState = defaultState,
    action: Events,
): NotificationsState {
    if (action.domain !== "notifications") return state;

    switch (action.type) {
        case "set-notifications":
            return {
                ...state,
                notifications: action.notifications,
                alert: action.alert ?? state.alert,
            };
        case "add-notification":
            return {
                ...state,
                notifications: [...state.notifications, action.notification],
                alert: true,
            };
        case "remove-notification": {
            const newNotifications = state.notifications.filter(
                (i) => i.id !== action.id,
            );
            return {
                ...state,
                notifications: newNotifications,
                alert: newNotifications.length === 0 ? false : state.alert,
            };
        }
        case "clear-all":
            return {
                ...state,
                notifications: [],
                alert: false,
            };
        default:
            return state;
    }
}
