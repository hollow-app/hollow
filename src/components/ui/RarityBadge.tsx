import { Title } from "@app/type/Character";
import { JSX } from "solid-js";

interface RarityBadgeProps {
	title: Title;
	displayLabel?: boolean;
	class?: string;
	children?: JSX.Element;
}

export function RarityBadge(props: RarityBadgeProps) {
	const rarityStyles = {
		legendary: {
			bg: "bg-yellow-500/15",
			text: "text-yellow-400",
			ring: "ring-yellow-500/30",
		},
		epic: {
			bg: "bg-purple-500/15",
			text: "text-purple-400",
			ring: "ring-purple-500/30",
		},
		rare: {
			bg: "bg-blue-500/15",
			text: "text-blue-400",
			ring: "ring-blue-500/30",
		},
		common: {
			bg: "bg-gray-400/15",
			text: "text-gray-400",
			ring: "ring-gray-400/30",
		},
	} as const;

	const style = rarityStyles[props.title.rarity] ?? rarityStyles.common;

	return (
		<span
			class={`shrink-0 items-center rounded-md px-2 py-1 text-[10px] font-semibold tracking-wide uppercase ring-1 ${style.bg} ${style.text} ${style.ring}`}
		>
			{props.displayLabel && (
				<>
					<span class="opacity-70">{props.title.label}</span>
					<span class="mx-1 opacity-40">•</span>
				</>
			)}
			<span>{props.title.rarity}</span>
		</span>
	);
}
