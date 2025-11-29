import { FormOption, FormType, ToolOption } from "@type/hollow";
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
import DynamicOption from "@components/DynamicOption";

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
									<DynamicOption
										option={option as ToolOption}
										index={index}
									/>
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
