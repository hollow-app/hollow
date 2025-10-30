import VaultIcon from "@assets/icons/vault.svg";
import VaultManager from "@managers/VaultManager";
import { FormType, FormOption } from "@type/hollow";
import { VaultItem } from "@type/VaultItem";
import { createSignal, For, Show } from "solid-js";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
	CopyIcon,
	ImageUpIcon,
	PencilIcon,
	SearchIcon,
	Trash2Icon,
} from "lucide-solid";
import PopupWrapper from "../PopupWrapper";
import { hollow } from "hollow";
import DropDown from "@components/DropDown";
const dt = new Date();
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
	const [filter, setFilter] = createSignal<{
		search: string;
		tags: string[];
		types: string[];
	}>({ search: "", tags: [], types: [] });

	const addItem = () => {
		const save = async (data: any) => {
			const appData = await appDataDir();
			const type = data.path.split(".").pop();
			const item: VaultItem = {
				id: data.id,
				type: type,
				name: data.name,
				path: convertFileSrc(
					await join(appData, "vault", `${data.id}.${type}`),
				),
				tags: data.tags ?? [],
				uploadedAt: new Date(),
			};
			await VaultManager.getSelf().addItem(item, data.path);
			setImages((prev) => [...prev, item]);
		};
		submitForm(save);
	};

	const copyItem = () => {
		navigator.clipboard.writeText(selectedItem().path);
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
		hollow.events.emit("confirm", {
			type: `Delete ${selectedItem().name}`,
			message: "You sure ?",
			onAccept: () => {
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
		const options: FormOption[] = [
			{
				key: "path",
				label: "Image",
				type: "file",
				accept: "image/*",
				value: target?.path ?? "",
			},
			{
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
		];
		if (update) {
			options.shift();
		}
		const form: FormType = {
			id: id ?? crypto.randomUUID(),
			title: update ? "Update Item" : "Add Image",
			submit: save,
			update: update,
			options: options,
		};
		hollow.events.emit("form", form);
	};

	const onImageClick = (item: VaultItem) => {
		setSelectedItem(item);
	};

	const onImageSelected = (path: string) => {
		onSelect(path);
		hollow.events.toggle("show-vault");
	};

	const filterByTypes = (v: string[]) => {
		setFilter((prev) => ({ ...prev, types: v }));
	};
	const filterByTags = (v: string[]) => {
		setFilter((prev) => ({ ...prev, tags: v }));
	};

	return (
		<PopupWrapper
			Icon={VaultIcon}
			title="Vault Storage"
			onClose={() => hollow.events.toggle("show-vault")}
		>
			<div class="lvl-1 flex flex-col gap-0 px-3 pb-3">
				<div class="flex items-center pb-3">
					<p class="text-secondary-40 px-3 text-sm tracking-wider">
						Storage for images — and more to come | Total:{" "}
						{images().length}.
					</p>

					<div class="relative z-1 ml-auto flex h-fit w-fit items-center justify-end gap-3 pr-3">
						<button
							class="button-control tool-tip"
							onClick={addItem}
						>
							<span class="tool-tip-content" data-side="top">
								import
							</span>
							<ImageUpIcon class="size-5" />
						</button>
						<DropDown
							isFilter
							options={() => [
								{
									title: "By Tags",
									isCheckBox: true,
									items: [
										...new Set(
											images().flatMap((i) => i.tags),
										),
									].map((i) => ({
										label: i,
										checked: filter().tags.includes(i),
									})),

									onSelect: filterByTags,
								},
								{
									title: "By Types",
									isCheckBox: true,
									items: [
										...new Set(
											images().flatMap((i) => i.type),
										),
									].map((i) => ({
										label: i,
										checked: filter().tags.includes(i),
									})),

									onSelect: filterByTypes,
								},
							]}
						/>
					</div>
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
				<hr class="border-secondary bg-secondary-10/50 h-[2px] w-full" />
				{/* Main content: gallery + sidebar */}
				<div class="flex min-h-0 w-full flex-1 overflow-hidden">
					{/* Gallery */}
					<div class="grid w-full grid-cols-7 grid-rows-5 gap-2 py-3">
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
							].slice(start(), start() + 35)}
						>
							{(img) => (
								<button
									class="group flex w-full flex-col"
									onclick={() => onImageClick(img)}
								>
									<img
										src={img.path}
										class="border-secondary-10 bg-secondary-05/50 group-hover:border-secondary-10 relative flex w-full flex-1 cursor-pointer flex-col overflow-hidden rounded border object-contain"
									/>
									<span class="w-full truncate text-sm font-medium text-ellipsis text-neutral-600 dark:text-neutral-400">
										{img.name}
									</span>
								</button>
							)}
						</For>
					</div>

					{/* Sidebar */}
					<div
						class="border-secondary-05 box-content w-0 shrink-0 border-l opacity-0 transition-all duration-300 ease-in-out"
						classList={{
							"w-92 opacity-100 pl-3 py-3": !!selectedItem(),
						}}
					>
						<Show when={selectedItem()}>
							<div class="flex h-full flex-col gap-2">
								<div class="flex items-start justify-between text-neutral-800 dark:text-neutral-200">
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
											<span class="bg-secondary-10 text-secondary-50 rounded px-2 py-1 text-xs">
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
											onclick={copyItem}
										>
											<CopyIcon class="size-5" />
										</button>
										<button
											class="button-control"
											onclick={editItem}
										>
											<PencilIcon class="size-5" />
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
				<Show when={images().length > 35}>
					<div class="border-secondary-05 flex h-fit w-full justify-center gap-5 rounded border-t pt-3">
						<For
							each={[
								...new Array(Math.ceil(images().length / 35)),
							]}
						>
							{(_, index) => (
								<button
									class="button-control"
									classList={{
										selected: start() === index() * 35,
									}}
									onclick={() => {
										if (start() !== index() * 35) {
											setStart(index() * 35);
										}
									}}
								>
									<p class="size-6">{index() + 1}</p>
								</button>
							)}
						</For>
					</div>
				</Show>
			</div>
		</PopupWrapper>
	);
}
