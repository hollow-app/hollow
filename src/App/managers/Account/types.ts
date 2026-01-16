import { Character } from "@type/Character";

export type CharacterState = Character;

export type Events = { domain: "account" } & (
	| {
			type: "add-achievement";
			achievement: string;
	  }
	| {
			type: "add-xp";
			amount: number;
	  }
	| {
			type: "level-up";
			amount?: number;
	  }
	| {
			type: "update-field";
			key: keyof Character;
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
