import { VaultItem } from "@type/VaultItem";
import { RustManager } from "./RustManager";
import { Storage } from "./Storage";
import { join } from "@tauri-apps/api/path";
import { RealmManager } from "./RealmManager";
import { hollow } from "hollow";
import { convertFileSrc } from "@tauri-apps/api/core";
import { writeFile } from "@tauri-apps/plugin-fs";
import { manager } from "./index";

export default class VaultManager {
	private store: Storage;

	public async start() {
		const path = await join(
			...[
				manager.realm.getCurrent().location,
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

	public getVault(): VaultItem[] {
		return this.store.get("__root__");
	}

	public async editItem(editedParts: any) {
		const vault: VaultItem[] = this.getVault().map((i) =>
			i.url === editedParts.url ? { ...i, ...editedParts } : i,
		);
		this.store.set("__root__", vault);
	}
	public async addUrlItem(image: string, name?: string) {
		try {
			const removeAlert = hollow.events.emit("alert", {
				type: "loading",
				title: "Loading",
				message: "Downloading...",
			});
			const path = await manager.rust.vault_add_url({
				url: image,
			});
			const url = convertFileSrc(path);
			const urlItem: VaultItem = {
				path,
				url,
				name: name ?? "unamed",
				type: path.split(".").pop() ?? "unknown",
				uploadedAt: new Date(),
			};
			removeAlert();
			this.store.set("__root__", [
				...(this.store.get("__root__") as VaultItem[]),
				urlItem,
			]);
			hollow.events.emit("alert", {
				type: "success",
				title: "Vault",
				message: `added 1 image`,
			});
			return url;
		} catch {
			hollow.events.emit("alert", {
				type: "error",
				title: "Vault",
				message: `Failed to add 1 image`,
			});
		}
	}
	public async addItems(images: string[]) {
		if (images.length > 0) {
			const addedImagesPaths: string[] =
				await manager.rust.vault_add({
					paths: images,
				});
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
			hollow.events.emit(
				"character-add-achievement",
				"🎨 Aesthetic Choice",
			);
			this.store.set("__root__", [
				...(this.store.get("__root__") as VaultItem[]),
				...asVaultItems,
			]);
		}
	}

	public async removeItems(paths: string[]) {
		if (paths.length > 0) {
			const targetFiles = paths
				.filter((i) => !i.startsWith("https"))
				.map((i) => this.getNameFromPath(i));
			void (await manager.rust.vault_remove({
				names: targetFiles,
			}));
		}
		this.store.set("__root__", [
			...(this.store.get("__root__") as VaultItem[]).filter(
				(i) => !paths.includes(i.path),
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
