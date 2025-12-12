import VaultIcon from "@assets/icons/vault.svg";
import { VaultProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";
import PopupWrapper from "@components/ui/PopupWrapper";
import { hollow } from "hollow";
import {
	CopyIcon,
	ImageUpIcon,
	LinkIcon,
	PencilIcon,
	SearchIcon,
} from "lucide-solid";
import FilterButton from "@components/FilterButton";
import { createSignal, For, onMount, Show } from "solid-js";
import MyIcon, { MyIconFun } from "@components/MyIcon";

export const VaultView = (
	state: StateType,
	logic: LogicType,
	props: VaultProps,
	helper?: HelperType,
) => {
	return (
		<PopupWrapper
			Icon={MyIconFun({ name: "strongbox-ghost" })}
			title="Vault Storage"
			onClose={() => hollow.events.toggle("show-vault")}
		>
			<div class="lvl-1 flex flex-col gap-0 px-3 pb-3">
				<div class="flex items-center pb-3">
					<p class="text-secondary-40 px-3 text-sm tracking-wider">
						Storage for images — and more to come | Total:{" "}
						{state.images().length}.
					</p>

					<div class="relative z-1 ml-auto flex h-fit w-fit items-center justify-end gap-3 pr-3">
						<AddUrl onAdd={logic.importImageFromLink} />
						<button
							class="button-control tool-tip"
							onClick={logic.importImages}
						>
							<span class="tool-tip-content" data-side="top">
								import
							</span>
							<ImageUpIcon class="size-5" />
						</button>
						<FilterButton options={state.filterOptions} />
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
								state.setFilter((prev) => ({
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
							each={state
								.filteredImages()
								.slice(state.start(), state.start() + 35)}
						>
							{(img) => (
								<button
									class="group flex w-full flex-col"
									onclick={() => logic.onImageClick(img)}
								>
									<img
										src={img.url}
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
							"w-92 opacity-100 pl-3 ml-3 py-3":
								!!state.selectedItem(),
						}}
					>
						<Show when={state.selectedItem()}>
							<div class="flex h-full flex-col gap-2">
								<div class="flex items-start justify-between text-neutral-800 dark:text-neutral-200">
									<h2 class="text-xl font-bold">
										{state.selectedItem()?.name}
									</h2>
									<button
										class="button-ctl"
										onclick={() =>
											state.setSelectedItem(null)
										}
									>
										✕
									</button>
								</div>
								<img
									src={state.selectedItem()?.url}
									class="bg-secondary-10 h-40 w-full rounded object-contain"
								/>
								<div class="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
									<p class="flex justify-between rounded p-1">
										<b>Type</b>
										<span class="tracking-widest text-neutral-500">
											{state.selectedItem()?.type}
										</span>
									</p>
									<p class="flex justify-between rounded p-1">
										<b>Uploaded</b>
										<span class="tracking-widest text-neutral-500">
											{state
												.selectedItem()
												?.uploadedAt.toLocaleString()}
										</span>
									</p>
								</div>
								<div class="flex flex-wrap gap-1">
									<For each={state.selectedItem()?.tags}>
										{(t) => (
											<span class="bg-secondary-10 text-secondary-50 rounded px-2 py-1 text-xs">
												{t}
											</span>
										)}
									</For>
								</div>

								<div class="mt-auto flex">
									<Show when={props.onSelect}>
										<button
											class="button-primary"
											onclick={() =>
												logic.onImageSelected(
													state.selectedItem().url,
												)
											}
										>
											Select
										</button>
									</Show>
									<div class="ml-auto space-x-2">
										<button
											class="button-control"
											onclick={logic.copyItem}
										>
											<CopyIcon class="size-5" />
										</button>
										<button
											class="button-control"
											onclick={logic.editItem}
										>
											<PencilIcon class="size-5" />
										</button>
										<button
											class="button-control red"
											onclick={logic.removeItem}
										>
											<MyIcon
												name="trash"
												class="size-5"
											/>
										</button>
									</div>
								</div>
							</div>
						</Show>
					</div>
				</div>
				<Show when={state.images().length > 35}>
					<div class="border-secondary-05 flex h-fit w-full justify-center gap-5 rounded border-t pt-3">
						<For
							each={[
								...new Array(
									Math.ceil(state.images().length / 35),
								),
							]}
						>
							{(_, index) => (
								<button
									class="button-control"
									classList={{
										selected:
											state.start() === index() * 35,
									}}
									onclick={() => {
										if (state.start() !== index() * 35) {
											state.setStart(index() * 35);
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
};

type AddUrlProps = {
	onAdd: (url: string) => void;
};
function AddUrl({ onAdd }: AddUrlProps) {
	const [isOpen, setOpen] = createSignal(false);
	const [url, setUrl] = createSignal("");
	const importImage = () => {
		onAdd(url());
		setUrl("");
		setOpen(false);
	};

	return (
		<div class="relative">
			<button
				class="button-control tool-tip"
				onclick={() => setOpen(!isOpen())}
			>
				<span class="tool-tip-content" data-side="top">
					import url
				</span>
				<LinkIcon class="size-5" />
			</button>
			<Show when={isOpen()}>
				<div class="bg-secondary-05 border-secondary-10 absolute top-10 right-0 flex w-60 gap-1 rounded-lg border p-1">
					<input
						class="input"
						style={{ "--padding-y": "var(--spacing)" }}
						value={url()}
						onInput={(e) => setUrl(e.currentTarget.value)}
						placeholder="https://..."
					/>
					<button class="button-secondary" onclick={importImage}>
						+
					</button>
				</div>
			</Show>
		</div>
	);
}
