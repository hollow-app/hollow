import { Achievement, Character, Title } from "center";
import { ClientUser } from "center";

type Connection = { state: boolean; type: "offline" | "online" };
export type AccountState = {
	user: Omit<ClientUser, "character">;
	character: Character;
	connection: Connection;
};

export type Events = { domain: "account" } & (
	| {
			type: "set-user";
			user: ClientUser;
	  }
	| {
			type: "set-connection";
			connection: Connection;
	  }
	| {
			type: "add-achievement";
			achievement: Achievement;
	  }
	| {
			type: "add-xp";
			amount: number;
	  }
	| {
			type: "add-title";
			title: Title;
	  }
	| {
			type: "update-title";
			id: string;
	  }
	| {
			type: "update-identity";
			key: keyof Character["identity"];
			value: any;
	  }
	| {
			type: "set-meta";
			props: Partial<{
				id: string;
				icon: string;
				label: string;
				value: any;
				color?: string;
			}>;
	  }
	| {
			type: "remove-meta";
			id: string;
	  }
);
