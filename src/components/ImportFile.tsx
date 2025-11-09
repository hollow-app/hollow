import { Trash2Icon } from "lucide-solid";
import { Show } from "solid-js";
import { createSignal } from "solid-js";
import { open } from "@tauri-apps/plugin-dialog";

type ImportFileProps = {
	xfile?: string;
	onChange: (img: string) => void;
};
export default function ImportFile({ onChange, xfile }: ImportFileProps) {
	const [file, setFile] = createSignal(xfile);

	const onImport = async () => {
		const path = await open({
			multiple: false,
			filters: [
				{
					name: "Images",
					extensions: ["png", "jpg", "jpeg", "gif", "webp"],
				},
			],
		});
		setFile(path);
		onChange(path);
	};

	return (
		<div class="flex w-full items-center justify-end gap-2">
			<Show when={file()}>
				<>
					<span class="w-fit text-xs text-neutral-300 dark:text-neutral-700">
						{file()}
					</span>
					<button
						class="button-control red"
						onclick={() => {
							setFile("");
							onChange("");
						}}
					>
						<Trash2Icon class="size-4.5" />
					</button>
				</>
			</Show>
			<button class="button-secondary" onclick={onImport}>
				Upload
			</button>
		</div>
	);
}
