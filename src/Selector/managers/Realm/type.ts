import { Realm } from "@type/Realm";

export type RealmState = {
    current: string | null;
    realms: Realm[];
    selectOnStartup: boolean;
};

export type Events =
    | { domain: "realm" } & (
        | {
            type: "set-state";
            state: Partial<RealmState>;
        }
        | {
            type: "set-select-on-startup";
            value: boolean;
        }
        | {
            type: "enter-realm";
            realmId: string;
        }
        | {
            type: "add-realm";
            realm: Realm;
        }
        | {
            type: "remove-realm";
            realmId: string;
        }
        | {
            type: "update-colors";
            colors: any;
        }
        | {
            type: "toggle-realm";
        }
    );
