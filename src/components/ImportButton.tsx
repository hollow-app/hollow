import { handleOptionFile } from "@managers/manipulation/images";
import { XIcon } from "lucide-solid";
import { createMemo, createSignal, Show } from "solid-js";

type ImportButtonProps = {
        option?: any;
};
export default function ImportButton({ option }: ImportButtonProps) {
        const [fileName, setFileName] = createSignal(option.name);
        // const isImage = createMemo(() => option.accept === "image/*");
        const onImport = (e: any) => {
                setFileName(e.currentTarget.files[0].name);
                handleOptionFile(e, option);
        };

        const onCancel = () => {
                option.onChange(null);
                setFileName(null);
        };

        return (
                <div class="flex items-center gap-10">
                        <Show when={fileName()}>
                                {" "}
                                <div
                                        class="bg-secondary-10 border-secondary-15 flex h-fit w-fit items-center gap-1 rounded border-1 px-2 py-1 text-sm"
                                        style={{ "line-height": 1 }}
                                >
                                        <span>{fileName()}</span>
                                        <XIcon
                                                class="bg-secondary-15 border-secondary-10 hover:bg-secondary-20 h-4 w-4 cursor-pointer rounded border-1 p-px"
                                                onclick={() => {
                                                        onCancel();
                                                }}
                                        />
                                </div>
                        </Show>
                        <label class="button-secondary cursor-pointer">
                                {option.label ?? "Choose File"}
                                <input
                                        type="file"
                                        accept={option?.accept}
                                        onChange={onImport}
                                        class="hidden"
                                />
                        </label>
                </div>
        );
}
