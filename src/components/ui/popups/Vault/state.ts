import { VaultProps } from ".";
import type { HelperType } from "./helper";
import { Accessor, createMemo, createSignal, Setter } from "solid-js";
import { VaultItem } from "@type/VaultItem";
import { DropdownOption } from "@components/FilterButton";
import { manager } from "@managers/index";

interface FilterType {
	search: string;
	tags: string[];
	types: string[];
}
export type StateType = {
	filteredImages: Accessor<VaultItem[]>;
	images: Accessor<VaultItem[]>;
	setImages: Setter<VaultItem[]>;
	start: Accessor<number>;
	setStart: Setter<number>;
	selectedItem: Accessor<VaultItem>;
	setSelectedItem: Setter<VaultItem>;
	filter: Accessor<FilterType>;
	setFilter: Setter<FilterType>;
	filterOptions: Accessor<DropdownOption[]>;
};

export const createVaultState = (
	props: VaultProps,
	helper?: HelperType,
): StateType => {
	const [images, setImages] = createSignal<VaultItem[]>([
		...manager.vault.getVault(),
	]);
	const [start, setStart] = createSignal(0);
	const [selectedItem, setSelectedItem] = createSignal<VaultItem | null>(
		null,
	);
	const [filter, setFilter] = createSignal<FilterType>({
		search: "",
		tags: [],
		types: [],
	});
	const filterOptions = createMemo<DropdownOption[]>(() => [
		{
			title: "By Types",
			isCheckBox: true,
			items: [...new Set(images().map((i) => i.type))].map((i) => ({
				label: i,
				checked: filter().types.includes(i),
			})),
			onSelect: (v: string[]) =>
				setFilter((prev) => ({ ...prev, types: v })),
		},
		{
			title: "By Tags",
			isCheckBox: true,
			items: [...new Set(images().flatMap((i) => i.tags ?? []))].map(
				(i) => ({
					label: i,
					checked: filter().tags.includes(i),
				}),
			),
			onSelect: (v: string[]) =>
				setFilter((prev) => ({ ...prev, tags: v })),
		},
	]);
	const filteredImages = createMemo(() => {
		const f = filter();
		const search = f.search.toLowerCase();
		const filterTags = f.tags.map((t) => t.toLowerCase());
		const filterTypes = f.types.map((t) => t.toLowerCase());

		return images().filter((img) => {
			if (search && !img.name.toLowerCase().includes(search)) {
				return false;
			}

			if (filterTags.length > 0) {
				const imgTags = (img.tags ?? []).map((t) => t.toLowerCase());
				const hasAllTags = [...filterTags].every((tag) =>
					imgTags.includes(tag),
				);
				if (!hasAllTags) return false;
			}

			if (
				filterTypes.length > 0 &&
				!filterTypes.includes(img.type.toLowerCase())
			) {
				return false;
			}

			return true;
		});
	});
	return {
		filteredImages,
		images,
		setImages,
		start,
		setStart,
		selectedItem,
		setSelectedItem,
		filter,
		setFilter,
		filterOptions,
	};
};
