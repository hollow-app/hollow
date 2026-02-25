import { ParentComponent } from "solid-js";

const SettingsPanel: ParentComponent<{ label: string }> = (props) => {
	return (
		<div class="h-fit w-full p-10">
			<h1 class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				{props.label}
			</h1>
			<div class="flex w-full flex-col gap-5 p-5 pb-9">
				{props.children}
			</div>
		</div>
	);
};

export default SettingsPanel;
