import { CardInfo } from "./CardInfo";

export type HandType = {
	version: string;
	icon: string;
	/**
	 * name : id, same as title but lowercased
	 */
	name: string;
	title?: string;
	description: string;
	author: string;
	authorUrl: string;
	dbVersion: number;
	cards: CardInfo[];
	signed?: boolean;
};
