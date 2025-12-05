import { VaultItem } from "@type/VaultItem";
import { RustManager } from "./RustManager";
import { Storage } from "./Storage";
import { join } from "@tauri-apps/api/path";
import { RealmManager } from "./RealmManager";
import { hollow } from "hollow";
import { convertFileSrc } from "@tauri-apps/api/core";

export default class VaultManager {
	private static self: VaultManager;
	private store: Storage;

	public async start() {
		const path = await join(
			...[
				RealmManager.getSelf().getCurrent().location,
				".hollow",
				"vault.json",
			],
		);
		this.store = await Storage.create({
			path,
			options: {
				defaults: { __root__: [] },
			},
		});
	}

	static getSelf() {
		if (!this.self) {
			this.self = new VaultManager();
		}
		return this.self;
	}

	public getVault(): VaultItem[] {
		return this.store.get("__root__");
	}

	public async editItem(editedParts: any) {
		const vault: VaultItem[] = this.getVault().map((i) =>
			i.url === editedParts.url ? { ...i, ...editedParts } : i,
		);
		this.store.set("__root__", vault);
	}
	public async addUrlItem(image: string) {
		const urlItem: VaultItem = {
			url: image,
			name: "unamed",
			type: image.split(".")[-1] ?? "unknown",
			uploadedAt: new Date(),
		};

		this.store.set("__root__", [
			...(this.store.get("__root__") as VaultItem[]),
			urlItem,
		]);
		hollow.events.emit("alert", {
			type: "success",
			title: "Vault",
			message: `added 1 image`,
		});
	}
	public async addItems(images: string[]) {
		if (images.length > 0) {
			const removeAlert = hollow.events.emit("alert", {
				type: "loading",
				title: "Vault",
				message: `adding ${images.length} images`,
			});
			const addedImagesPaths: string[] =
				await RustManager.getSelf().vault_add({
					paths: images,
				});
			removeAlert();
			hollow.events.emit("alert", {
				type: addedImagesPaths.length > 0 ? "success" : "warning",
				title: "Vault",
				message: `added ${addedImagesPaths.length} images`,
			});
			const asVaultItems: VaultItem[] = addedImagesPaths.map((i) => {
				return {
					path: i,
					url: convertFileSrc(i),
					name: "unamed",
					type: i.split(".").pop() ?? "unknown",
					uploadedAt: new Date(),
				};
			});
			this.store.set("__root__", [
				...(this.store.get("__root__") as VaultItem[]),
				...asVaultItems,
			]);
		}
	}

	public async removeItems(urls: string[]) {
		const paths = (this.store.get("__root__") as VaultItem[])
			.filter((i) => urls.includes(i.url) && !i.url.startsWith("https"))
			.map((i) => i.path);
		if (paths.length > 0) {
			const targetFiles = paths
				.filter((i) => !i.startsWith("https"))
				.map((i) => this.getNameFromPath(i));
			void (await RustManager.getSelf().vault_remove({
				names: targetFiles,
			}));
		}
		this.store.set("__root__", [
			...(this.store.get("__root__") as VaultItem[]).filter(
				(i) => !urls.includes(i.url),
			),
		]);
	}
	private getNameFromPath(filePath: string): string {
		const parts = filePath.split(/[/\\]/);
		return parts[parts.length - 1];
	}

	private watcherFileAdded(path: string) {
		console.log("file added", path);
	}
	private watcherFileRemoved(path: string) {
		console.log("file removed", path);
	}
	private watcherFileRenamed(paths: string[]) {
		console.log("file renamed", paths);
	}
}
