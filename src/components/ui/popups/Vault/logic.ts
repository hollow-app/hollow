import { VaultProps } from ".";
import type { StateType } from "./state";
import type { HelperType } from "./helper";
import { open } from "@tauri-apps/plugin-dialog";
import VaultManager from "@managers/VaultManager";
import { hollow } from "hollow";
import { ConfirmType, FormOption, FormType } from "@type/hollow";
import { VaultItem } from "@type/VaultItem";

export type LogicType = {
	importImages: () => void;
	importImageFromLink: (url: string) => Promise<void>;
	copyItem: () => void;
	editItem: () => void;
	removeItem: () => void;
	onImageClick: (item: VaultItem) => void;
	onImageSelected: (url: string) => void;
};

export const VaultLogic = (
	state: StateType,
	props: VaultProps,
	helper?: HelperType,
): LogicType => {
	const importImages = async () => {
		const images = await open({
			multiple: true,
			title: "Select File",
			filters: [
				{
					name: "Images",
					extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
				},
			],
		});
		await VaultManager.getSelf().addItems(images);
		state.setImages(VaultManager.getSelf().getVault());
	};
	const importImageFromLink = async (imageUrl: string) => {
		await VaultManager.getSelf().addUrlItem(imageUrl);
		state.setImages(VaultManager.getSelf().getVault());
	};

	const copyItem = () => {
		navigator.clipboard.writeText(state.selectedItem().url);
	};

	const editItem = () => {
		const { path, url } = state.selectedItem();
		const save = async (data: any) => {
			const { id, ...wantedData } = data;
			await VaultManager.getSelf().editItem({ ...wantedData, path, url });
			state.setImages((prev) =>
				prev.map((i) => (i.url === url ? { ...i, ...wantedData } : i)),
			);
			state.setSelectedItem((prev) => ({ ...prev, ...wantedData }));
		};
		submitForm(save, url);
	};

	const removeItem = () => {
		const pack: ConfirmType = {
			title: `Delete ${state.selectedItem().name}`,
			message: "You sure ?",
			onAccept: () => {
				state.setImages((prev) => [
					...prev.filter((i) => i.url !== state.selectedItem().url),
				]);
				VaultManager.getSelf().removeItems([state.selectedItem().path]);
				state.setSelectedItem(null);
			},
		};
		hollow.events.emit("confirm", pack);
	};

	const submitForm = (save: (data: any) => void, id?: string) => {
		const target = state.selectedItem();
		const options: FormOption[] = [
			{
				key: "name",
				label: "Name",
				type: "text",
				value: target?.name ?? "",
				attributes: { placeholder: "File Name" },
				row: true,
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
			submit: save,
			update: true,
			options: options,
		};
		hollow.events.emit("form", form);
	};

	const onImageClick = (item: VaultItem) => {
		state.setSelectedItem(item);
	};

	const onImageSelected = (url: string) => {
		props.onSelect(url);
		hollow.events.toggle("show-vault");
	};

	return {
		onImageSelected,
		copyItem,
		editItem,
		importImageFromLink,
		importImages,
		onImageClick,
		removeItem,
	};
};
