import type { Character } from "./Character";
import type { Relationships } from "./relationships";

export interface User {
	uid: string;
	username: string;
	character: Character;
	verification: {
		verified: boolean;
		discord?: { username: string };
		application?: { id: string };
	};
	createdAt: string;
	relationships: Relationships;
}
