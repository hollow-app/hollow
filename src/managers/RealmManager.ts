import { Realm } from "@type/Realm";
import { Setter } from "solid-js";

export class RealmManager {
        public realms: Realm[] = [];
        public currentRealmId: string = undefined;
        private setCurrentRealm: Setter<string> = null;

        constructor(setCurrentRealm: Setter<string>) {
                const savedRealms = localStorage.getItem("realms") ?? "[]";
                this.realms = JSON.parse(savedRealms);
                this.currentRealmId = localStorage.currentRealmId;
                this.setCurrentRealm = setCurrentRealm;
        }

        public enterRealm(realmId: string) {
                this.currentRealmId = realmId;
                localStorage.currentRealmId = realmId;
                this.setCurrentRealm(realmId);
                // reload the app or open it in a new window.
        }
        public addRealm(nRealm: Realm) {
                this.realms.push(nRealm);
                this.update();
        }
        public removeRealm(realmId: string) {
                this.realms = this.realms.filter((i) => i.id !== realmId);
                if (realmId === this.currentRealmId) {
                        this.enterRealm(null);
                }
                this.update();
                localStorage.removeItem(`${realmId}-color-primary`);
                localStorage.removeItem(`${realmId}-color-secondary`);
                localStorage.removeItem(`${realmId}-canvas`);
                localStorage.removeItem(`${realmId}-tools`);
        }

        private update() {
                localStorage.setItem("realms", JSON.stringify(this.realms));
        }

        public updateColors(obj: any) {
                const realm = this.getRealmFromId(this.currentRealmId);
                if (realm) {
                        realm.colors = { ...realm.colors, ...obj };
                }
        }

        public toggleRealm() {
                this.setCurrentRealm((prev: string) =>
                        prev === undefined ? this.currentRealmId : undefined,
                );
        }
        public getRealmFromId(id: string) {
                return this.realms.find((i) => i.id === id);
        }
}
