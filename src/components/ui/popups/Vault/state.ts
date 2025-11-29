import VaultManager from "@managers/VaultManager";
import { VaultProps } from ".";
import type { HelperType } from "./helper";
import { Accessor, createSignal, Setter } from "solid-js";
import { VaultItem } from "@type/VaultItem";

interface FilterType {
	search: string;
	tags: string[];
}
export type StateType = {
	images: Accessor<VaultItem[]>;
	setImages: Setter<VaultItem[]>;
	start: Accessor<number>;
	setStart: Setter<number>;
	selectedItem: Accessor<VaultItem>;
	setSelectedItem: Setter<VaultItem>;
	filter: Accessor<FilterType>;
	setFilter: Setter<FilterType>;
};

export const createVaultState = (
	props: VaultProps,
	helper?: HelperType,
): StateType => {
	const [images, setImages] = createSignal<VaultItem[]>([
		...VaultManager.getSelf().getVault(),
	]);
	const [start, setStart] = createSignal(0);
	const [selectedItem, setSelectedItem] = createSignal<VaultItem | null>(
		null,
	);
	const [filter, setFilter] = createSignal<FilterType>({
		search: "",
		tags: [],
	});
	return {
		images,
		setImages,
		start,
		setStart,
		selectedItem,
		setSelectedItem,
		filter,
		setFilter,
	};
};

