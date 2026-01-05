import ScrollIcon from "@assets/icons/scroll.svg";
import { FormType, ToolOption } from "@type/hollow";
import { Accessor, For, onMount, Setter } from "solid-js";
import { createSignal } from "solid-js";
import { hollow } from "hollow";
import { Show } from "solid-js";
import DynamicOption from "@components/dynamic/DynamicOption";
import PopupWrapper from "../PopupWrapper";

type FormProps = {
	form: FormType;
	setForm: Setter<FormType[]>;
	index: Accessor<number>;
};
export default function Form({ form, setForm, index }: FormProps) {
	const width = form.options.some((i) => i.inline) ? "700px" : "450px";
	const id = "form-" + index();
	const [result, setResult] = createSignal({
		...form.options.reduce((acc: Record<string, any>, obj) => {
			acc[obj.key] = obj.value;
			return acc;
		}, {}),
		id: form.id,
	});
	const onSave = (e) => {
		e.preventDefault();
		const submission: any = result();
		// - check if any of those conditions are true in any option
		// 	- 1: if its text and has pattern, you check if its false input (form checks that)
		// 	- 2: if the option is optional you skip it
		// 	- 3: if it depends on another option, you check if it's value is included in the ok list (dependsOn.conditions)
		if (
			!form.options.some((i) => {
				if (i.optional) return false;
				return i.dependsOn
					? i.dependsOn.conditions.includes(
							submission[i.dependsOn.key] && !submission[i.key],
						)
					: !submission[i.key];
			})
		) {
			form.submit(submission);
			onCancel();
		}
	};
	const onCancel = () => {
		setForm((prev) => prev.filter((i) => i.id !== form.id));
	};
	return (
		<PopupWrapper title={form.title} Icon={ScrollIcon} onClose={onCancel}>
			<form
				id={id}
				class="flex max-h-[85vh] max-w-[80vw] flex-col gap-4 px-5 pb-5"
				style={{
					width,
				}}
				onsubmit={onSave}
			>
				<Show when={form.description}>
					<div class="border-secondary-15 flex items-start gap-5 border-b border-dashed pb-5">
						<h3 class="text-secondary-50 text-sm">
							{form.description}
						</h3>
					</div>
				</Show>
				<div class="flex h-full flex-wrap overflow-x-hidden overflow-y-auto">
					<For each={form.options}>
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
									<div class="mb-2 flex w-full flex-col gap-1.5">
										<h2 class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
											{option.label}
											<Show when={!option.optional}>
												<span class="text-primary-10 text-sm">
													*
												</span>
											</Show>
										</h2>
										<Show when={option.description}>
											<p class="text-xs text-neutral-500">
												{option.description}
											</p>
										</Show>
									</div>
									<div class="shrink-0">
										<DynamicOption
											option={option as ToolOption}
											index={index}
										/>
									</div>
								</div>
							);
						}}
					</For>
				</div>
				<div class="mt-auto flex h-fit w-full justify-end gap-3 rounded">
					<button class="button primary form-submit" type="submit">
						{form.update ? "Update" : "Submit"}
					</button>
					<button class="button secondary" onclick={onCancel}>
						Cancel
					</button>
				</div>
			</form>
		</PopupWrapper>
	);
}
//
