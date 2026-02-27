/**
 * Relationship-related type definitions
 */

import { Character } from "./Character";

export interface Relationships {
	friends: RelationshipUser[];
	incomingRequests: RelationshipUser[];
	blocked: RelationshipUser[];
	blockedBy: RelationshipUser[];
}

export interface RelationshipUser {
	uid: string;
	username: string;
	createdAt: string;
	character?: Omit<Character, "titles">;
}
