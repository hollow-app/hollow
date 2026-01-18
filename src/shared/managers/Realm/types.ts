import { Realm } from "@type/Realm";

export type RealmState = {
    current: Realm | null; // Currently active realm (null if in selector)
    realms: Realm[]; // Full list of realms
    selectOnStartup: boolean; // Whether to show selector on startup
};

export type Events =
    | { domain: "realm" } & (
        | {
            type: "load-realms";
            state: {
                current: string | null;
                realms: Realm[];
                selectOnStartup: boolean;
            };
        }
        | {
            type: "set-realm";
            realm: Realm;
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
            type: "set-select-on-startup";
            value: boolean;
        }
        | {
            type: "enter-realm";
            realmId: string;
        }
    );
