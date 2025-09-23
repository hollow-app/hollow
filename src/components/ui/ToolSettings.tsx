import ColorPick from "@components/ColorPick";
import DropDown from "@components/DropDown";
import EmojiPick from "@components/EmojiPick";
import ImportButton from "@components/ImportButton";
import NumberInput from "@components/NumberInput";
import Slider from "@components/Slider";
import WordInput from "@components/WordInput";
import { handleOptionFile } from "@managers/manipulation/images";
import { ToolOption, ToolOptions } from "@type/ToolOptions";
import { createMemo, For } from "solid-js";

type ToolSettingsProps = {
	pluginSettings: ToolOptions;
};
export default function ToolSettings({ pluginSettings }: ToolSettingsProps) {
	const card = createMemo(() =>
		window.toolManager.hand
			.find((i) => i.name === pluginSettings.tool.toLowerCase())
			.cards.find((i) => i.name == pluginSettings.card),
	);

	const onSave = () => {
		pluginSettings.save();
		window.hollowManager.emit("tool-settings", null);
	};

	const onCancel = () => {
		pluginSettings.options.forEach((option) => {
			option.type !== "custom" && option.onChange(option.value);
		});
		window.hollowManager.emit("tool-settings", null);
	};
	return (
		<div class="bg-secondary-05 up-pop border-secondary-15 shadow-popup pointer-events-auto absolute flex h-fit max-h-[70%] w-[60%] flex-col overflow-hidden rounded-2xl border-1 p-5">
			<div class="flex h-fit gap-10 pb-5 ">
				<span class="bg-secondary-10 flex h-30 w-30 items-center justify-center rounded-lg p-3 text-center text-6xl">
					{card().emoji}
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
								<div class="flex w-full justify-between px-3 ">
									<div class="w-full">
										<h1 class="text-lg font-bold">
											{option.label}
										</h1>
										<h3 class="text-secondary-40">
											{/*
                                                                                                option.description
                                                                                        */}
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
									<div class="w-full flex justify-end h-fit">
										{(() => {
											switch (option.type) {
												case "text":
													return (
														<input
															type="text"
															class="input"
															style={{
																"--bg-color":
																	"var(--color-secondary-10)",
															}}
															placeholder={
																option.placeholder
															}
															value={option.value}
															onInput={(e) =>
																option.onChange(
																	e
																		.currentTarget
																		.value,
																)
															}
														/>
													);
												case "longtext":
													return (
														<textarea
															class="input w-full resize-none"
															style={{
																"--bg-color":
																	"var(--color-secondary-10)",
															}}
															placeholder={
																option.placeholder
															}
															value={option.value}
															onInput={(e) =>
																option.onChange(
																	e
																		.currentTarget
																		.value,
																)
															}
														/>
													);
												case "number":
													return (
														<NumberInput
															value={option.value}
															setValue={
																option.onChange
															}
															min={option.min}
															max={option.max}
															direct
														/>
													);

												case "boolean":
													return (
														<div class="toggle-switch">
															<input
																class="toggle-input"
																id={`tool-option-toggle-${index()}`}
																type="checkbox"
																checked={
																	option.value
																}
																onchange={(e) =>
																	option.onChange(
																		e
																			.currentTarget
																			.checked,
																	)
																}
															/>
															<label
																class="toggle-label"
																for={`tool-option-toggle-${index()}`}
															></label>
														</div>
													);

												case "button":
													return (
														<button
															onClick={
																option.onChange
															}
															class="button-secondary"
														>
															{option.value}
														</button>
													);

												case "color":
													return (
														<ColorPick
															color={option.value}
															setColor={
																option.onChange
															}
														/>
													);
												case "emoji":
													return (
														<button
															//onclick={option.onChange}
															class={
																"bg-secondary-10 h-10 w-10 content-center rounded-xl text-center text-2xl text-gray-900 select-none dark:text-gray-50"
															}
														>
															<EmojiPick
																emo={
																	option.value
																}
																emoChanged={
																	option.onChange
																}
															/>
														</button>
													);

												case "dropdown":
													return (
														<DropDown
															value={option.value}
															onSelect={(v) =>
																option.onChange(
																	v,
																)
															}
															items={
																option.options
															}
														/>
													);

												case "file":
													return (
														<ImportButton
															option={option}
														/>
													);

												case "range":
													return (
														<Slider
															min={option.min}
															max={option.max}
															value={option.value}
															setValue={
																option.onChange
															}
														/>
													);
												case "keywords":
													return (
														<WordInput
															words={() =>
																option.value
															}
															setWords={
																option.onChange
															}
															placeholder={
																option.placeholder
															}
														/>
													);

												default:
													return null;
											}
										})()}
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
			<div class="bg-secondary-10/60 mt-auto flex h-fit w-full justify-end gap-5 rounded p-5">
				<button class="button-primary" onclick={onSave}>
					Save
				</button>
				<button class="button-secondary" onclick={onCancel}>
					Cancel
				</button>
			</div>
		</div>
	);
}
