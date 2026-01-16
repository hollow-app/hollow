export type PrivateEvents = {
	"post-realm": Promise<void>;
	"deep-link": string[];
	"ui-set-character": (character: Character) => void;
	editor: { tool: string; cardId: string };
	"context-menu": boolean;
};
