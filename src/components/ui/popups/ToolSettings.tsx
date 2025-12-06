import ColorPick from "@components/ColorPick";
import Dropdown from "@components/Dropdown";
import DynamicOption from "@components/DynamicOption";
import EmojiPick from "@components/EmojiPick";
import ImportFile from "@components/ImportFile";
import NumberInput from "@components/NumberInput";
import Slider from "@components/Slider";
import WordInput from "@components/WordInput";
import { ToolOption, ToolOptions } from "@type/hollow";
import { hollow } from "hollow";
import { options } from "marked";
import { createMemo, For } from "solid-js";

type ToolSettingsProps = {
	pluginSettings: ToolOptions;
};
export default function ToolSettings({ pluginSettings }: ToolSettingsProps) {
	const card = createMemo(() =>
		hollow.toolManager
			.getHand()
			.find((i) => i.name === pluginSettings.tool.toLowerCase())
			.cards.find((i) => i.data.extra.name == pluginSettings.card),
	);

	const onSave = () => {
		pluginSettings.save();
		hollow.events.emit("tool-settings", null);
	};

	const onCancel = () => {
		pluginSettings.options.forEach((option) => {
			if (option.type !== "custom" && option.type !== "file")
				option.onAction(option.value);
		});
		hollow.events.emit("tool-settings", null);
	};
	return (
		<div class="pop-up">
			<div class="up-pop pointer-events-auto flex h-fit max-h-[70%] w-[60%] flex-col overflow-hidden p-5">
				<div class="flex h-fit gap-10 pb-5">
					<span class="bg-secondary-05 flex h-30 w-30 items-center justify-center rounded-lg p-3 text-center text-6xl">
						{card().data.extra.emoji}
					</span>
					<div class="flex-1 rounded-lg">
						<h1 class="text-4xl font-bold text-gray-950 dark:text-gray-50">
							{pluginSettings.tool}
						</h1>
						<h3 class="text-secondary-60 text-xl font-semibold">
							{pluginSettings.card}
						</h3>
					</div>
				</div>
				<hr class="border-secondary-15 h-px w-full border-dashed" />
				<div class="flex h-fit flex-col gap-10 overflow-hidden overflow-y-scroll py-5 text-neutral-950 dark:text-neutral-100">
					<For each={pluginSettings.options}>
						{(option: ToolOption, index) => (
							<>
								{option.type !== "custom" ? (
									<div class="flex w-full justify-between px-3">
										<div class="w-full">
											<h1 class="text-lg font-bold">
												{option.label}
											</h1>
											<h3 class="text-secondary-40">
												<For
													each={option.description.split(
														/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
													)}
												>
													{(part, index) => {
														if (index() % 3 === 0) {
															return part;
														} else if (
															index() % 3 ===
															1
														) {
															return null;
														} else if (
															index() % 3 ===
															2
														) {
															const linkText =
																option.description.split(
																	/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
																)[index() - 1];
															return (
																<a
																	href={part}
																	target="_blank"
																	rel="noopener noreferrer"
																	class="text-primary"
																>
																	{linkText}
																</a>
															);
														}
													}}
												</For>
											</h3>
										</div>

										{/* Right side */}
										<div class="flex h-fit w-full justify-end">
											<DynamicOption
												option={option}
												index={index}
											/>
										</div>
									</div>
								) : (
									<div class="flex w-full shrink-0 justify-between px-3">
										{option.render()}
									</div>
								)}
							</>
						)}
					</For>
				</div>
				<div class="bg-secondary-05 mt-auto flex h-fit w-full justify-end gap-5 rounded p-5">
					<button
						type="button"
						class="button-primary"
						onclick={onSave}
					>
						Save
					</button>
					<button
						type="button"
						class="button-secondary"
						onclick={onCancel}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
