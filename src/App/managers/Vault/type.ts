import { VaultItem } from "@type/VaultItem";

export type VaultState = {
    items: VaultItem[];
};

export type Events =
    | { domain: "vault" } & (
        | {
            type: "set-items";
            items: VaultItem[];
        }
        | {
            type: "add-items";
            items: VaultItem[];
        }
        | {
            type: "add-url-item";
            image: string;
            name?: string;
        }
        | {
            type: "remove-items";
            paths: string[];
        }
        | {
            type: "edit-item";
            editedParts: Partial<VaultItem> & { url: string };
        }
    );
