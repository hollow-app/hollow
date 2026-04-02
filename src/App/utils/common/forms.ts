import ToolIcon from "@app/components/ui/ToolIcon";
import { HandType } from "@app/type/HandType";
import { FormType } from "@app/type/hollow";
import { DispatchType } from "@shared/store";
import { hollow } from "hollow";
import { Accessor } from "solid-js";

export function form_newInstance(
	dispatch: DispatchType,
	hand: () => Record<string, HandType>,
) {
	const onSave = (data: any) => {
		dispatch({
			domain: "module",
			type: "add-instance",
			toolName: data.tool.toLowerCase(),
			name: data.name,
			emoji: data.emoji,
		});
	};
	const form: FormType = {
		id: crypto.randomUUID(),
		title: "Create Card",
		description:
			"This form creates a new tool instance by defining its name, configuration.",
		options: [
			{
				type: "dropdown",
				label: "Module",
				key: "tool",
				description: "The module that will be inside this card",
				placeholder: "Module",
				options: [
					{
						items: Object.entries(hand()).map(([k, v]) => ({
							label: k,
							icon: (props: { class?: string }) =>
								ToolIcon({ toolName: v.icon || k, ...props }),
						})),
					},
				],
			},
			{
				type: "text",
				key: "name",
				label: "Card Name",
				attributes: {
					pattern: "^[A-Za-z]+$",
					placeholder: "Card name (e.g., ToDo)",
					title: "Only letters (A-Z, a-z) are allowed",
				},
			},
			{
				type: "emoji",
				label: "Emoji",
				value: "☂️",
				row: true,
				description: "Give this card an emoji",
				key: "emoji",
			},
		],
		submit: onSave,
	};

	hollow.events.emit("form", form);
}
