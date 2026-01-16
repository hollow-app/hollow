import { createSignal, createMemo, Accessor, Setter } from "solid-js";
import { open } from "@tauri-apps/plugin-dialog";
import { hollow } from "hollow";
import { ConfirmType, FormOption, FormType } from "@type/hollow";
import { VaultItem } from "@type/VaultItem";
import { join } from "@tauri-apps/api/path";
import { DropdownOption } from "@components/ui/FilterButton";
import { openPath } from "@tauri-apps/plugin-opener";
import { useStore } from "store";
import { importFiles, importFileUrl } from "@managers/Vault";
import { getCurrentRealm } from "@managers/Realm";

export interface VaultProps {
	onSelect?: (p: string) => void;
}

interface FilterType {
	search: string;
	tags: string[];
	types: string[];
}

export interface VaultState {
	filteredImages: Accessor<VaultItem[]>;
	images: Accessor<VaultItem[]>;
	start: Accessor<number>;
	setStart: Setter<number>;
	selectedItem: Accessor<VaultItem | null>;
	setSelectedItem: Setter<VaultItem | null>;
	filter: Accessor<FilterType>;
	setFilter: Setter<FilterType>;
	filterOptions: Accessor<DropdownOption[]>;
}

export interface VaultActions {
	importImages: () => Promise<void>;
	importImageFromLink: (url: string) => Promise<void>;
	copyItem: () => void;
	editItem: () => void;
	removeItem: () => void;
	onImageClick: (item: VaultItem) => void;
	onImageSelected: (url: string) => void;
	openVaultDirectory: () => Promise<void>;
}

export interface VaultHook {
	state: VaultState;
	actions: VaultActions;
}

export const useVault = (props: VaultProps): VaultHook => {
	const { state, dispatch } = useStore();
	const images = createMemo(() => state.vault.items);
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

	const importImages = async () => {
		const selected = await open({
			multiple: true,
			title: "Select File",
			filters: [
				{
					name: "Images",
					extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
				},
			],
		});
		if (selected) {
			importFiles(selected);
		}
	};

	const importImageFromLink = async (imageUrl: string) => {
		importFileUrl(imageUrl);
	};

	const copyItem = () => {
		const item = selectedItem();
		if (item) {
			navigator.clipboard.writeText(item.url);
		}
	};

	const submitForm = (save: (data: any) => void, id?: string) => {
		const target = selectedItem();
		const options: FormOption[] = [
			{
				key: "name",
				label: "Name",
				type: "text",
				value: target?.name ?? "",
				attributes: { placeholder: "File Name" },
			},
			{
				key: "tags",
				label: "Tags",
				optional: true,
				type: "keywords",
				value: target?.tags ?? [],
			},
		];
		const form: FormType = {
			id: id ?? crypto.randomUUID(),
			title: "Update Item",
			description: "Modify metadata of this image for better scope.",
			submit: save,
			update: true,
			options: options,
		};
		hollow.events.emit("form", form);
	};

	const editItem = () => {
		const item = selectedItem();
		if (!item) return;
		const { path, url } = item;
		const save = async (data: any) => {
			const { id, ...wantedData } = data;
			dispatch({
				domain: "vault",
				type: "set-items",
				items: { ...wantedData, path, url },
			});
			setSelectedItem((prev) =>
				prev ? { ...prev, ...wantedData } : null,
			);
		};
		submitForm(save, url);
	};

	const removeItem = () => {
		const item = selectedItem();
		if (!item) return;
		const pack: ConfirmType = {
			title: `Delete ${item.name}`,
			message: "You sure ?",
			onAccept: () => {
				dispatch({
					domain: "vault",
					type: "remove-items",
					paths: [item.path],
				});
				setSelectedItem(null);
			},
		};
		hollow.events.emit("confirm", pack);
	};

	const onImageClick = (item: VaultItem) => {
		setSelectedItem(item);
	};

	const onImageSelected = (url: string) => {
		props.onSelect?.(url);
		hollow.events.toggle("show-vault");
	};

	const openVaultDirectory = async () => {
		await openPath(await join(...[getCurrentRealm().location, "vault"]));
	};

	return {
		state: {
			filteredImages,
			images,
			start,
			setStart,
			selectedItem,
			setSelectedItem,
			filter,
			setFilter,
			filterOptions,
		},
		actions: {
			onImageSelected,
			copyItem,
			editItem,
			importImageFromLink,
			importImages,
			onImageClick,
			removeItem,
			openVaultDirectory,
		},
	};
};
