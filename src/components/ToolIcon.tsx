import { hollow } from "hollow";
import ImageIcon from "@assets/icons/tools/image.svg";
import NotebookIcon from "@assets/icons/tools/notebook.svg";
import EmbedIcon from "@assets/icons/tools/embed.svg";
import KanbanIcon from "@assets/icons/tools/kanban.svg";
import { Show } from "solid-js";
import FetchedIcon from "./FetchedIcon";

interface ToolIconProps {
	toolName: string;
	class?: string;
}

export default function ToolIcon(props: ToolIconProps) {
	const isCore = hollow.coreTools.includes(props.toolName);
	return (
		<Show
			when={!isCore}
			fallback={<CoreIcon name={props.toolName} class={props.class} />}
		>
			<FetchedIcon url={props.toolName} class={props.class} />
		</Show>
	);
}

const coreIconMap: Record<string, any> = {
	image: ImageIcon,
	notebook: NotebookIcon,
	kanban: KanbanIcon,
	embed: EmbedIcon,
};

function CoreIcon(props: { name: string; class?: string }) {
	const Icon = coreIconMap[props.name];
	return Icon ? <Icon class={`tool-icon ` + (props.class ?? "")} /> : null;
}
