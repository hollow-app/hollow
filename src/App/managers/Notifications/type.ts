import { NotifyType } from "@type/NotifyType";

export type NotificationsState = {
    notifications: NotifyType[];
    alert: boolean;
};

export type Events =
    | { domain: "notifications" } & (
        | {
            type: "set-notifications";
            notifications: NotifyType[];
            alert?: boolean;
        }
        | {
            type: "add-notification";
            notification: NotifyType;
        }
        | {
            type: "remove-notification";
            id: string;
        }
        | {
            type: "clear-all";
        }
        | {
            type: "check-repo";
        }
    );
