import { FormType } from "@type/hollow";
import { Accessor, For } from "solid-js";
import { createSignal } from "solid-js";
import ColorPick from "@components/ColorPick";
import EmojiPick from "@components/EmojiPick";
import NumberInput from "@components/NumberInput";
import Slider from "@components/Slider";
import WordInput from "@components/WordInput";
import ImportFile from "@components/ImportFile";
import { hollow } from "hollow";
import Dropdown from "@components/Dropdown";
import { Show } from "solid-js";

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
	const onSave = (e) => {
		e.preventDefault();
		const submission: any = result();
		// - check if any of those conditions are true in any option
		// 	- 1: if its text and has pattern, you check if its false input (form checks that)
		// 	- 2: if the option is optional you skip it
		// 	- 3: if it depends on another option, you check if it's value is included in the ok list (dependsOn.conditions)
		if (
			!form().options.some((i) => {
				if (i.optional) return false;
				return i.dependsOn
					? i.dependsOn.conditions.includes(
							submission[i.dependsOn.key] && !submission[i.key],
						)
					: !submission[i.key];
			})
		) {
			form().submit(submission);
			hollow.events.emit("form", null);
		}
	};
	const onCancel = () => {
		hollow.events.emit("form", null);
	};
	return (
		<form class="pop-up" onsubmit={onSave}>
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

				<div class="flex h-full flex-wrap overflow-x-hidden overflow-y-auto">
					<For each={form().options}>
						{(preOption, index) => {
							const option = {
								...preOption,
								onAction: (v: any) => {
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
									class="relative p-1 transition-all duration-200 ease-in-out"
									classList={{
										hidden: dependable(),
										"my-2": !dependable(),
										"w-[50%]": option.inline,
										"w-full": !option.inline,
										"flex justify-between":
											option.row && !option.inline,
									}}
								>
									<div class="mb-2 flex w-[50%] items-center gap-2">
										<h2
											class="flex gap-1 text-lg text-neutral-800 dark:text-neutral-200"
											classList={{
												"tool-tip":
													!!option.description,
											}}
										>
											{option.label}
											<Show when={option.description}>
												<>
													<span class="text-secondary-20 font-bold">
														[ i ]
													</span>
													<span
														class="tool-tip-content"
														data-side="right"
													>
														{option.description}
													</span>
												</>
											</Show>
											<Show when={!option.optional}>
												<span class="text-primary-10 text-sm">
													*
												</span>
											</Show>
										</h2>
									</div>
									{(() => {
										switch (option.type) {
											case "text":
												return (
													<input
														type="text"
														class="input w-full"
														{...option.attributes}
														value={
															option.value ?? ""
														}
														onInput={(e) =>
															option.onAction(
																e.currentTarget
																	.value,
															)
														}
														required={
															!option.optional
														}
													/>
												);
											case "longtext":
												return (
													<textarea
														class="input resize-none"
														{...option.attributes}
														value={
															option.value ?? ""
														}
														onInput={(e) =>
															option.onAction(
																e.currentTarget
																	.value,
															)
														}
														required={
															!option.optional
														}
													/>
												);

											case "number":
												return (
													<NumberInput
														value={() =>
															option.value ??
															option.min
														}
														setValue={
															option.onAction
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
																option.onAction(
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
															option.onAction
														}
														class="button-secondary"
														type="button"
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
															option.onAction
														}
													/>
												);

											case "emoji":
												return (
													<button
														class={
															"bg-secondary-10 h-10 w-10 content-center rounded-xl text-center text-2xl text-gray-900 select-none dark:text-gray-50"
														}
														type="button"
													>
														<EmojiPick
															emo={
																option.value ??
																"☂️"
															}
															emoChanged={
																option.onAction
															}
														/>
													</button>
												);

											case "dropdown":
												return (
													<Dropdown
														value={() =>
															option.value ?? ""
														}
														placeholder={
															option.placeholder
														}
														options={() =>
															option.options
														}
														onSelect={
															option.onAction
														}
													/>
												);
											case "file":
												return (
													<ImportFile
														xfile={option.value}
														onChange={
															option.onAction
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
															option.onAction
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
																option.onAction
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
					<button class="button-primary" type="submit">
						{form().update ? "Update" : "Submit"}
					</button>
					<button class="button-secondary" onclick={onCancel}>
						Cancel
					</button>
				</div>
			</div>
		</form>
	);
}
//
