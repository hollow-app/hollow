import VaultManager from "@managers/VaultManager";
import { FormType } from "@type/FormType";
import { VaultItem } from "@type/VaultItem";
import { createSignal, For, Show } from "solid-js";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ImageUpIcon, SearchIcon, Trash2Icon } from "lucide-solid";
import FilterButton from "@components/FilterButton";
import { EditPencil01 } from "@coolicons-dev/solid";

type VaultStorageProps = {
	onSelect?: (p: string) => void;
};
export default function VaultStorage({ onSelect }: VaultStorageProps) {
	const [images, setImages] = createSignal<VaultItem[]>([
		...VaultManager.getSelf().getVault(),
	]);
	const [start, setStart] = createSignal(0);
	const [selectedItem, setSelectedItem] = createSignal<VaultItem | null>(
		null,
	);
	// const [selectedGroup, setSelectedGroup] = createSignal<string[]>([]);
	const [filter, setFilter] = createSignal<{
		search: string;
		tags: string[];
		types: string[];
	}>({ search: "", tags: [], types: [] });

	const addItem = () => {
		const save = async (data: any) => {
			const appData = await appDataDir();
			const id = crypto.randomUUID();
			const type = data.path.split(".").pop();
			const item: VaultItem = {
				id: id,
				type: type,
				name: data.name,
				path: convertFileSrc(
					await join(appData, "vault", `${id}.${type}`),
				),
				tags: data.tags ?? [],
				uploadedAt: new Date(),
			};
			await VaultManager.getSelf().addItem(item, data.path);
			setImages((prev) => [...prev, item]);
		};
		submitForm(save);
	};

	const editItem = () => {
		const id = selectedItem().id;
		const save = async (data: any) => {
			await VaultManager.getSelf().editItem({ ...data, id });
			setImages((prev) =>
				prev.map((i) => (i.id === id ? { ...i, ...data } : i)),
			);
			setSelectedItem((prev) => ({ ...prev, ...data }));
		};
		submitForm(save, id);
	};

	const removeItem = () => {
		window.hollowManager.emit("confirm", {
			type: `Delete ${selectedItem().name}`,
			message: "You sure ?",
			decision: () => {
				setImages((prev) => [
					...prev.filter((i) => i.id === selectedItem().id),
				]);
				VaultManager.getSelf().removeItem(selectedItem().id);
			},
		});
	};

	const submitForm = (save: (data: any) => void, id?: string) => {
		const target = selectedItem();
		const update = !!id;
		const form: FormType = {
			id: id ?? "new_file",
			title: update ? "Update Item" : "Add Image",
			submit: save,
			update: update,
			options: [
				{
					...(!update
						? [
								{
									key: "path",
									label: "Image",
									type: "file",
									accept: "image/*",
									value: target?.path ?? "",
								},
							]
						: []),

					key: "name",
					label: "Name",
					type: "text",
					value: target?.name ?? "",
					placeholder: "File Name",
				},
				{
					key: "tags",
					label: "Tags",
					optional: true,
					type: "keywords",
					value: target?.tags ?? [],
				},
			],
		};
		window.hollowManager.emit("form", form);
	};

	const onImageClick = (item: VaultItem) => {
		setSelectedItem(item);
	};

	const onImageSelected = (path: string) => {
		onSelect(path);
		window.hollowManager.toggle("show-vault");
	};

	const filterByTypes = (v: string[]) => {
		setFilter((prev) => ({ ...prev, types: v }));
	};
	const filterByTags = (v: string[]) => {
		setFilter((prev) => ({ ...prev, tags: v }));
	};

	const nextPage = () => {
		if (start() + 15 < images().length) setStart(start() + 15);
	};
	const prevPage = () => {
		if (start() - 15 >= 0) setStart(start() - 15);
	};

	return (
		<div class="pop-up">
			<div class="up-pop pointer-events-auto flex h-[70vh] max-h-[85vh] w-[65vw] max-w-[85vw] flex-col">
				{/* Header */}
				<div class="border-secondary-10 flex h-fit w-full items-center border-b">
					<div class="flex flex-col justify-center rounded-lg pl-5">
						<h1 class="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
							Vault Storage
						</h1>
						<p class="mt-1 text-sm font-medium text-neutral-500">
							Storage for images — and more to come | Total:{" "}
							{images().length}.
						</p>
					</div>
					<button
						class="button-secondary mr-5 ml-auto flex items-center gap-2"
						style={{ "--padding-x": "calc(var(--spacing) * 2)" }}
						onClick={addItem}
					>
						<ImageUpIcon class="size-5" />
						Import
					</button>
					<div class="border-secondary-10 relative z-1 flex w-fit items-center justify-end gap-3 border-l px-5 py-5">
						<FilterButton
							label="Filter"
							configs={[
								{
									id: "image-types",
									type: "multioption",
									label: "Types",
									options: [
										...new Set(images().map((i) => i.type)),
									],
									onChange: filterByTypes,
								},
								{
									id: "image-tags",
									type: "multioption",
									label: "Tags",
									options: [
										...new Set(
											images()
												.map((i) => i.tags)
												.flat(),
										),
									],
									onChange: filterByTags,
								},
							]}
						/>
						<div class="relative w-80">
							<input
								class="input peer focus:bg-secondary-10 ml-auto h-fit max-w-full text-sm transition-all duration-200"
								style={{
									"--border-w": "0px",
									"--padding-y": "calc(var(--spacing) * 3.5)",
									"--padding-x":
										"calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
									"--bg-color-f": "var(--secondary-color-15)",
								}}
								onInput={(e) =>
									setFilter((prev) => ({
										...prev,
										search: e.currentTarget.value,
									}))
								}
								placeholder="Search images..."
							/>
							<SearchIcon class="text-secondary-30 peer-focus:text-secondary-90 absolute top-1/2 left-3 w-5 -translate-y-1/2 transition-colors" />
						</div>
					</div>
				</div>
				{/* Main content: gallery + sidebar */}
				<div class="flex flex-1 overflow-hidden">
					{/* Gallery */}
					<div class="grid grid-cols-6 grid-rows-4 gap-2 p-5">
						<For
							each={[
								...images().filter(
									(i) =>
										i.name.includes(filter().search) &&
										(filter().types.length === 0 ||
											filter().types.includes(i.type)) &&
										(filter().tags.length === 0 ||
											filter().tags.some((j) =>
												i.tags.includes(j),
											)),
								),
							].slice(start(), start() + 15)}
						>
							{(img) => (
								<button
									class="group flex w-full flex-col"
									onclick={() => onImageClick(img)}
								>
									<img
										src={img.path}
										class="bg-secondary-10 group-hover:border-secondary-20 relative flex w-full flex-1 cursor-pointer flex-col overflow-hidden rounded border border-transparent object-contain"
									/>
									<span class="w-full truncate font-medium text-ellipsis text-neutral-600 dark:text-neutral-400">
										{img.name}
									</span>
								</button>
							)}
						</For>
					</div>

					{/* Sidebar */}
					<div
						class={`border-secondary-10 box-content w-0 shrink-0 border-l opacity-0 transition-all duration-300 ease-in-out`}
						classList={{
							"w-92 opacity-100 px-5 py-5": !!selectedItem(),
						}}
					>
						<Show when={selectedItem()}>
							<div class="flex h-full flex-col gap-2">
								<div class="flex items-start justify-between">
									<h2 class="text-xl font-bold">
										{selectedItem()?.name}
									</h2>
									<button
										class="button-ctl"
										onclick={() => setSelectedItem(null)}
									>
										✕
									</button>
								</div>
								<img
									src={selectedItem()?.path}
									class="bg-secondary-10 h-40 w-full rounded object-contain"
								/>
								<div class="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
									<p class="flex justify-between rounded p-1">
										<b>Type</b>
										<span class="tracking-widest text-neutral-500">
											{selectedItem()?.type}
										</span>
									</p>
									<p class="flex justify-between rounded p-1">
										<b>Uploaded</b>
										<span class="tracking-widest text-neutral-500">
											{selectedItem()?.uploadedAt.toLocaleString()}
										</span>
									</p>
								</div>
								<div class="flex flex-wrap gap-1">
									<For each={selectedItem()?.tags}>
										{(t) => (
											<span class="bg-secondary-10 rounded px-2 py-1 text-xs">
												{t}
											</span>
										)}
									</For>
								</div>

								<div class="mt-auto flex">
									<Show when={onSelect}>
										<button
											class="button-primary"
											onclick={() =>
												onImageSelected(
													selectedItem().path,
												)
											}
										>
											Select
										</button>
									</Show>
									<div class="ml-auto space-x-2">
										<button
											class="button-control"
											onclick={editItem}
										>
											<EditPencil01 class="size-5" />
										</button>
										<button
											class="button-control red"
											onclick={removeItem}
										>
											<Trash2Icon class="size-5" />
										</button>
									</div>
								</div>
							</div>
						</Show>
					</div>
				</div>
			</div>
		</div>
	);
}
