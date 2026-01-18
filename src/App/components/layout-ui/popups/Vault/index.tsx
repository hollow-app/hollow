import { Component, createSignal, For, Show } from "solid-js";
import PopupWrapper from "@components/layout-ui/PopupWrapper";
import { hollow } from "../../../../../hollow";
import {
	CopyIcon,
	ImageUpIcon,
	LinkIcon,
	PencilIcon,
	SearchIcon,
	XIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "lucide-solid";
import FilterButton from "@components/ui/FilterButton";
import MyIcon, { MyIconFun } from "@components/ui/MyIcon";
import Tag from "@components/ui/Tag";
import { useVault, VaultProps } from "./hooks";
import { Accessor } from "solid-js";

const ITEMS_PER_PAGE = 21;

export const Vault: Component<VaultProps> = (props) => {
	const { state, actions } = useVault(props);

	return (
		<PopupWrapper
			Icon={MyIconFun({ name: "strongbox-outline" })}
			title="Vault Storage"
			onClose={() => hollow.events.toggle("show-vault")}
		>
			<div class="flex h-[650px] max-h-[90vh] w-[1000px] max-w-[80vw] flex-col gap-4 p-1">
				{/* Header */}
				<div class="flex items-center justify-between gap-4 px-2">
					<div class="text-secondary-foreground/60 flex items-center gap-2 text-sm">
						<button
							onclick={actions.openVaultDirectory}
							class="hover:text-secondary-foreground font-medium transition-colors"
						>
							Vault
						</button>
						<span class="text-secondary-20">/</span>
						<span>All Files</span>
						<span class="bg-secondary-10 text-secondary-50 rounded-full px-2 py-0.5 text-xs font-medium">
							{state.images().length}
						</span>
					</div>

					<div class="flex items-center gap-2">
						<div class="relative w-64">
							<SearchIcon class="text-secondary-40 absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
							<input
								class="border-secondary-20 placeholder:text-secondary-40 focus:border-secondary-30 h-9 w-full rounded-md border bg-transparent pr-3 pl-9 text-sm transition-all outline-none"
								onInput={(e) =>
									state.setFilter((prev) => ({
										...prev,
										search: e.currentTarget.value,
									}))
								}
								placeholder="Search..."
							/>
						</div>
						<div class="bg-secondary-20 mx-1 h-4 w-[1px]"></div>
						<AddUrl onAdd={actions.importImageFromLink} />
						<button
							id="vault-import-local-btn"
							class="button-control"
							onClick={actions.importImages}
							title="Import Local"
						>
							<ImageUpIcon class="size-4" />
						</button>
						<FilterButton options={state.filterOptions} />
					</div>
				</div>

				{/* Main Content */}
				<div class="flex min-h-0 w-full flex-1 gap-4 overflow-hidden">
					{/* Gallery */}
					<div class="grid w-full grid-cols-7 content-start gap-3 overflow-hidden pr-1 pb-2">
						<For
							each={state
								.filteredImages()
								.slice(
									state.start(),
									state.start() + ITEMS_PER_PAGE,
								)}
						>
							{(img) => (
								<button
									class="group relative flex flex-col gap-2 outline-none"
									onclick={() => actions.onImageClick(img)}
								>
									<div class="border-secondary-10 bg-secondary-05 group-hover:border-primary-50/50 aspect-square w-full overflow-hidden rounded-md border transition-all group-hover:shadow-sm">
										<img
											src={img.url}
											class="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
										/>
									</div>
									<span class="text-secondary-60 group-hover:text-secondary-foreground w-full truncate text-center text-xs font-medium transition-colors">
										{img.name}
									</span>
								</button>
							)}
						</For>
					</div>

					{/* Sidebar */}
					<Show when={state.selectedItem()}>
						<div class="bg-secondary-10/50 animate-in slide-in-from-right-5 flex w-80 shrink-0 flex-col gap-4 rounded-lg p-4 duration-200">
							<div class="flex items-start justify-between">
								<h2 class="text-secondary-foreground line-clamp-1 text-lg font-semibold break-all">
									{state.selectedItem()?.name}
								</h2>
								<button
									class="text-secondary-40 hover:text-secondary-foreground transition-colors"
									onclick={() => state.setSelectedItem(null)}
								>
									<XIcon class="size-5" />
								</button>
							</div>

							<div class="border-secondary-10 bg-secondary-05 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border">
								<img
									src={state.selectedItem()?.url}
									class="max-h-full max-w-full object-contain shadow-sm"
								/>
							</div>

							<div class="grid grid-cols-2 gap-4 text-sm">
								<div class="flex flex-col gap-1">
									<span class="text-secondary-40 text-xs font-medium tracking-wider uppercase">
										Type
									</span>
									<span class="text-secondary-80">
										{state.selectedItem()?.type}
									</span>
								</div>
								<div class="col-span-2 flex flex-col gap-1">
									<span class="text-secondary-40 text-xs font-medium tracking-wider uppercase">
										Uploaded
									</span>
									<span class="text-secondary-80">
										{state
											.selectedItem()
											?.uploadedAt.toLocaleString()}
									</span>
								</div>
							</div>

							<div class="flex flex-col gap-2">
								<span class="text-secondary-40 text-xs font-medium tracking-wider uppercase">
									Tags
								</span>
								<div class="flex flex-wrap gap-1.5">
									<For each={state.selectedItem()?.tags}>
										{(t) => <Tag tag={t} />}
									</For>
								</div>
							</div>

							<div class="mt-auto flex flex-col gap-2 pt-4">
								<Show when={props.onSelect}>
									<button
										class="button primary w-full justify-center"
										onclick={() =>
											actions.onImageSelected(
												state.selectedItem()!.url,
											)
										}
									>
										Select Image
									</button>
								</Show>
								<div class="flex gap-2">
									<button
										class="button-control flex flex-1 justify-center gap-2"
										onclick={actions.copyItem}
									>
										<CopyIcon class="size-4" />
									</button>
									<button
										class="button-control flex-1 justify-center gap-2"
										onclick={actions.editItem}
									>
										<PencilIcon class="size-4" />
									</button>
									<button
										class="button-control red"
										onclick={actions.removeItem}
									>
										<MyIcon name="trash" class="size-4" />
									</button>
								</div>
							</div>
						</div>
					</Show>
				</div>

				{/* Pagination */}
				<Show when={state.images().length > ITEMS_PER_PAGE}>
					<div class="border-secondary-10 flex items-center justify-between border-t px-2 pt-2 pb-1">
						<div class="text-secondary-40 text-xs font-medium">
							Showing {state.start() + 1}-
							{Math.min(
								state.start() + ITEMS_PER_PAGE,
								state.filteredImages().length,
							)}{" "}
							of {state.filteredImages().length}
						</div>
						<div class="flex items-center gap-2">
							<button
								class="button-control disabled:opacity-50"
								disabled={state.start() === 0}
								onclick={() =>
									state.setStart(
										Math.max(
											0,
											state.start() - ITEMS_PER_PAGE,
										),
									)
								}
							>
								<ChevronLeftIcon class="size-4" />
							</button>
							<span class="text-secondary-60 text-xs font-medium">
								Page{" "}
								{Math.floor(state.start() / ITEMS_PER_PAGE) + 1}{" "}
								of{" "}
								{Math.ceil(
									state.filteredImages().length /
										ITEMS_PER_PAGE,
								)}
							</span>
							<button
								class="button-control disabled:opacity-50"
								disabled={
									state.start() + ITEMS_PER_PAGE >=
									state.filteredImages().length
								}
								onclick={() =>
									state.setStart(
										state.start() + ITEMS_PER_PAGE,
									)
								}
							>
								<ChevronRightIcon class="size-4" />
							</button>
						</div>
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
				id="vault-import-url-btn"
				class="button-control"
				onclick={() => setOpen(!isOpen())}
				title="Import URL"
			>
				<LinkIcon class="size-4" />
			</button>
			<Show when={isOpen()}>
				<div class="border-secondary-10 bg-secondary-05 animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-2 flex w-72 gap-2 rounded-lg border p-2 shadow-lg duration-100">
					<input
						class="input"
						value={url()}
						onInput={(e) => setUrl(e.currentTarget.value)}
						placeholder="https://..."
						autofocus={true}
					/>
					<button
						class="button-control flex h-8 w-8 shrink-0 items-center justify-center rounded-md p-0"
						onclick={importImage}
					>
						+
					</button>
				</div>
			</Show>
		</div>
	);
}

export default Vault;
