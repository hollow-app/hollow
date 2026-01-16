import { Realm } from "@type/Realm";

export type RealmState = Realm | null;

export type Events = { domain: "realm" } & (
	| {
			type: "set-realm";
			realm: Realm;
	  }
	| {
			type: "update-colors";
			colors: any;
	  }
);
