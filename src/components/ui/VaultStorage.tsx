import VaultManager from "@managers/VaultManager";
import { VaultItem } from "@type/VaultItem";
import { FormType } from "hollow-api";
import { createMemo, createSignal, For, onMount } from "solid-js";

export default function VaultStorage() {
	const [images, setImages] = createSignal<VaultItem[]>(
		VaultManager.getSelf().getVault(),
	);
	const requested = createMemo(
		() => !!window.hollowManager.getCurrentData("on-vault"),
	);

	const addItem = () => {
		const save = (data: any) => {
			const item = {
				...data,
				id: crypto.randomUUID(),
				type: "image",
				uploadedAt: new Date().toISOString(),
			};
			setImages((prev) => [...prev, item]);
			VaultManager.getSelf().addItem(item);
		};
		submitForm(save);
	};

	const submitForm = (save: (data: any) => void, id?: string) => {
		const target = id ? images().find((i) => i.id) : null;
		const form: FormType = {
			id: id ?? "meta",
			title: id ? "Update Meta" : "Add Meta",
			submit: save,
			update: !!id,
			options: [
				{
					key: "content",
					label: "Image",
					type: "file",
					accept: "image/*",
					value: target?.name ?? "",
				},
				{
					key: "name",
					label: "Name",
					type: "text",
					value: target?.name ?? "",
				},
				{
					key: "tags",
					label: "Tags",
					type: "keywords",
					value: target?.name ?? [],
				},
			],
		};
		window.hollowManager.emit("Form", form);
	};

	return (
		<div class="pointer-events-auto absolute flex max-h-[85vh] h-[60vh] w-[55vw] max-w-[85vw] flex-col gap-4 up-pop z-3 p-5">
			<div class="flex gap-5 items-start border-b border-dashed border-secondary-15 pb-5 justify-between">
				<h1 class="text-3xl  font-bold text-neutral-900 dark:text-neutral-100">
					Vault
				</h1>
				<button class="button-secondary" onclick={addItem}>
					import
				</button>
			</div>

			<div class="flex-1 w-full flex flex-wrap gap-2">
				<For each={images()}>
					{(img) => (
						<div class="bg-secondary-05/50 p-2 h-fit rounded">
							<img
								src={img.content}
								class="w-50 rounded bg-secondary-10"
							/>
							<span class="text-neutral-500 w-full text-ellipsis">
								{img.name}
							</span>
							<div class="flex gap-1 flex-wrap">
								<For each={img.tags.slice(0, 4)}>
									{(tag) => (
										<span class="bg-secondary-10 rounded tracking-widest text-xs px-1 text-secondary-40">
											{tag}
										</span>
									)}
								</For>
							</div>
						</div>
					)}
				</For>
			</div>
		</div>
	);
}
