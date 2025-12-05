import { Trash2Icon } from "lucide-solid";
import { Show } from "solid-js";
import { createSignal } from "solid-js";
import { hollow } from "hollow";

type ImportFileProps = {
	xfile?: string;
	onChange: (img: string) => void;
};
export default function ImportFile({ onChange, xfile }: ImportFileProps) {
	const [file, setFile] = createSignal(xfile);

	const onImport = async () => {
		hollow.events.emit("show-vault", {
			onSelect: (s) => {
				onChange(s);
				setFile(s);
			},
		});
	};

	return (
		<div class="flex w-full items-center justify-end gap-2">
			<Show when={file()}>
				<>
					<img class="h-full w-30 rounded" src={file()} />
					<button
						class="button-control red"
						type="button"
						onclick={() => {
							setFile("");
							onChange("");
						}}
					>
						<Trash2Icon class="size-4.5" />
					</button>
				</>
			</Show>
			<button class="button-secondary" type="button" onclick={onImport}>
				Upload
			</button>
		</div>
	);
}
