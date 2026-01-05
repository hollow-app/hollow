import DynamicOption from "@components/dynamic/DynamicOption";
import { ToolOption, ToolOptions } from "@type/hollow";
import { hollow } from "hollow";
import { createMemo, For, Show } from "solid-js";
import PopupWrapper from "../PopupWrapper";
import { MyIconFun } from "@components/MyIcon";

type ToolSettingsProps = {
	pluginSettings: ToolOptions;
};
export default function ToolSettings({ pluginSettings }: ToolSettingsProps) {
	const card = createMemo(() =>
		hollow.toolManager
			.getHand()
			[
				pluginSettings.tool.toLowerCase()
			].cards.find((i) => i.data.name == pluginSettings.card),
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
		<PopupWrapper
			title={pluginSettings.tool}
			Icon={MyIconFun({ name: "gear-outline" })}
			onClose={onCancel}
		>
			<div class="max-h-[70vh] min-w-[30vw] px-5 pb-5">
				<div class="flex h-fit items-center gap-2 pb-5">
					<span class="bg-secondary-05 flex size-10 items-center justify-center rounded-lg p-1 text-center text-xl">
						{card().data.emoji}
					</span>
					<h3 class="text-secondary-60 text-2xl font-semibold">
						{pluginSettings.card}
					</h3>
				</div>
				<hr class="border-secondary-15 h-px w-full border-dashed" />
				<div class="flex h-fit flex-col gap-10 overflow-hidden overflow-y-scroll py-5 text-neutral-950 dark:text-neutral-100">
					<For each={pluginSettings.options}>
						{(option: ToolOption, index) => (
							<>
								<div class="flex w-full flex-col justify-between gap-2 px-3">
									<div class="w-full space-y-1.5">
										<h2 class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
											{option.label}
										</h2>
										<Show when={option.description}>
											<p class="text-xs text-neutral-500">
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
											</p>
										</Show>
									</div>

									{/* Right side */}
									<div class="flex h-fit w-full justify-end">
										<DynamicOption
											option={option}
											index={index}
										/>
									</div>
								</div>
							</>
						)}
					</For>
				</div>
				<div class="bg-secondary-05 mt-auto flex h-fit w-full justify-end gap-5 rounded p-5">
					<button
						type="button"
						class="button primary"
						onclick={onSave}
					>
						Save
					</button>
					<button
						type="button"
						class="button secondary"
						onclick={onCancel}
					>
						Cancel
					</button>
				</div>
			</div>
		</PopupWrapper>
	);
}
