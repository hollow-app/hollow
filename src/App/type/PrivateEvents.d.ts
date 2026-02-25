import { PluginCapability } from "./hollow";

export type PrivateEvents = {
	"post-realm": void;
	"pre-realm": void;
	"deep-link": string[];
	"ui-set-character": (character: Character) => void;
	editor: { tool: string; cardId: string };
	"context-menu": boolean;
	capabilities: PluginCapability[];
	"post-capabilities": void;
	"pre-capabilities": void;
	"push-capabilities": PluginCapability[];
};
