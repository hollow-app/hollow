import { CardType } from "./hollow";

export type HandType = {
	version: string;
	icon?: string;
	/**
	 * name : id, same as title but lowercased
	 */
	name: string;
	description: string;
	author: string;
	authorUrl: string;
	cards: CardType[];
	signed?: boolean;
};
