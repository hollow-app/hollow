import { FormType } from "@type/hollow";
import { Accessor, For } from "solid-js";
import { createSignal } from "solid-js";
import ColorPick from "./ColorPick";
import DropDown from "./DropDown";
import EmojiPick from "./EmojiPick";
import NumberInput from "./NumberInput";
import Slider from "./Slider";
import WordInput from "./WordInput";
import ImportFile from "./ImportFile";

type FormPopProps = {
	form: Accessor<FormType>;
};
export default function FormPop({ form }: FormPopProps) {
	const [result, setResult] = createSignal({
		...form().options.reduce((acc: Record<string, any>, obj) => {
			acc[obj.key] = obj.value;
			return acc;
		}, {}),
		id: form().id,
	});
	const onSave = () => {
		const submission: any = result();
		if (
			!form().options.some((i) => {
				if (
					i.type === "text" &&
					i.pattern &&
					!new RegExp(i.pattern).test(submission[i.key])
				)
					return true;
				if (i.optional) return false;
				return i.dependsOn
					? i.dependsOn.conditions.includes(
							submission[i.dependsOn.key] && !submission[i.key],
						)
					: !submission[i.key];
			})
		) {
			form().submit(submission);
			window.hollowManager.emit("form", null);
		}
	};
	const onCancel = () => {
		window.hollowManager.emit("form", null);
	};
	return (
		<div class="pop-up">
			<div class="up-pop pointer-events-auto absolute flex max-h-[85vh] w-[85vw] max-w-[800px] flex-col gap-4 p-5">
				<div class="border-secondary-15 flex items-start gap-5 border-b border-dashed pb-5">
					<div>
						<h1 class="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
							Form
							<span class="text-xl font-light text-neutral-500">
								:{form().title}
							</span>
						</h1>
						<h3 class="bg-secondary-10 rounded px-2 text-sm font-medium tracking-wider text-neutral-500 uppercase">
							{form().description}
						</h3>
					</div>
				</div>

				<div class="flex h-full flex-col overflow-x-hidden overflow-y-auto">
					<For each={form().options}>
						{(preOption, index) => {
							const option = {
								...preOption,
								onChange: (v: any) => {
									setResult((prev) => ({
										...prev,
										[preOption.key]: v,
									}));
								},
							};
							const dependable = () =>
								option.dependsOn &&
								!option.dependsOn.conditions.includes(
									(result() as any)[option.dependsOn.key],
								);
							return (
								<div
									class="relative flex flex-col transition-all duration-200 ease-in-out"
									classList={{
										" hidden": dependable(),
										" my-2": !dependable(),
									}}
								>
									<div class="mb-2 flex items-center gap-2">
										<h2
											class="flex gap-1 text-lg text-neutral-800 dark:text-neutral-200"
											classList={{
												"tool-tip":
													!!option.description,
											}}
										>
											{option.label}{" "}
											{option.description && (
												<>
													<span class="text-secondary-20 font-light tracking-widest">
														[i]
													</span>
													<span
														class="tool-tip-content"
														data-side="right"
													>
														{option.description}
													</span>
												</>
											)}
											{!option.optional && (
												<span class="text-primary-10 text-sm">
													*
												</span>
											)}
										</h2>
									</div>
									{(() => {
										switch (option.type) {
											case "text":
												return (
													<input
														type="text"
														class="input w-full"
														pattern={option.pattern}
														placeholder={
															option.placeholder
														}
														value={
															option.value ?? ""
														}
														onInput={(e) =>
															option.onChange(
																e.currentTarget
																	.value,
															)
														}
													/>
												);
											case "longtext":
												return (
													<textarea
														class="input resize-none"
														placeholder={
															option.placeholder
														}
														value={
															option.value ?? ""
														}
														onInput={(e) =>
															option.onChange(
																e.currentTarget
																	.value,
															)
														}
													/>
												);

											case "number":
												return (
													<NumberInput
														value={
															option.value ??
															option.min
														}
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
																!!option.value
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
														click
													</button>
												);

											case "color":
												return (
													<ColorPick
														color={() =>
															option.value ??
															"#FFFFFF"
														}
														setColor={
															option.onChange
														}
													/>
												);

											case "emoji":
												return (
													<button
														class={
															"bg-secondary-10 h-10 w-10 content-center rounded-xl text-center text-2xl text-gray-900 select-none dark:text-gray-50"
														}
													>
														<EmojiPick
															emo={
																option.value ??
																"☂️"
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
														value={() =>
															option.value ??
															option.options[0]
														}
														onSelect={(v) =>
															option.onChange(v)
														}
														items={option.options}
													/>
												);
											case "file":
												{
													/* TODO this is not how to handle selecting an image, it needs to be from vault, also the vault uses this to get the path, so maybe keep this and add a image selector */
												}
												return (
													<ImportFile
														xfile={option.value}
														onChange={
															option.onChange
														}
													/>
												);
											case "range":
												return (
													<Slider
														min={option.min}
														max={option.max}
														value={
															option.value ??
															option.min
														}
														setValue={
															option.onChange
														}
													/>
												);

											case "keywords":
												return (
													<div class="max-h-40 max-w-full">
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
													</div>
												);

											default:
												return null;
										}
									})()}
								</div>
							);
						}}
					</For>
				</div>
				<div class="bg-secondary-05 mt-auto flex h-fit w-full justify-end gap-5 rounded px-[3rem] py-5">
					<button class="button-primary" onclick={onSave}>
						{form().update ? "Update" : "Submit"}
					</button>
					<button class="button-secondary" onclick={onCancel}>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
//
