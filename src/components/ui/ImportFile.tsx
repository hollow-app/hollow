import { Show } from "solid-js";
import { createSignal } from "solid-js";
import MyIcon from "../../App/components/ui/MyIcon";
import { toggleVault } from "@app/context/actions";
import { Button } from "./Button";

type ImportFileProps = {
	xfile?: string;
	onChange: (img: string) => void;
};
export default function ImportFile({ onChange, xfile }: ImportFileProps) {
	const [file, setFile] = createSignal(xfile);

	const onImport = async () => {
		toggleVault((s) => {
			onChange(s);
			setFile(s);
		});
	};

	return (
		<div class="flex w-full items-center justify-end gap-2">
			<Show when={file()}>
				<>
					<img
						class="bg-secondary-10 h-full max-h-10 w-30 rounded"
						src={file()}
					/>
					<Button.Root
						class="red"
						type="button"
						variant="ghost"
						onclick={() => {
							setFile("");
							onChange("");
						}}
						icon
					>
						<MyIcon name="trash" class="size-4.5" />
					</Button.Root>
				</>
			</Show>
			<button class="button secondary" type="button" onclick={onImport}>
				Upload
			</button>
		</div>
	);
}
