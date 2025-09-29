import { Trash2Icon } from "lucide-solid";
import { Show } from "solid-js";
import { createSignal } from "solid-js";

type ImportFileProps = {
	xfile?: string;
	accepts?: string;
	onChange: (img: string) => void;
};
export default function ImportFile({
	accepts,
	onChange,
	xfile,
}: ImportFileProps) {
	const [file, setFile] = createSignal(xfile);

	const onImport = async () => {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = accepts;

		fileInput.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				const reader = new FileReader();

				reader.onloadend = () => {
					const content = reader.result as string;
					setFile(content);
					onChange(content);
					fileInput.remove();
				};

				reader.onerror = (error) => {
					console.log(error);
					fileInput.remove();
				};
				reader.readAsDataURL(file);
			} else {
				console.log(new Error("No file selected"));
				fileInput.remove();
			}
		};
		fileInput.click();
	};

	return (
		<div class="w-full flex gap-2 justify-end items-center">
			<Show when={file()}>
				<button
					class="button-control red"
					onclick={() => {
						setFile("");
						onChange("");
					}}
				>
					<Trash2Icon class="size-4.5" />
				</button>
			</Show>
			<button class="button-secondary" onclick={onImport}>
				Import
			</button>
		</div>
	);
}
