import { ToolApi } from "@type/hollow";
import type { KanbanProps } from ".";
import { KanbanManager } from "../KanbanManager";

export type HelperType = {
	toolEvents: ToolApi;
};

export const KanbanHelper = (props: KanbanProps): HelperType => {
	const toolEvents = KanbanManager.getSelf().getEvents();
	return {
		toolEvents,
	};
};

