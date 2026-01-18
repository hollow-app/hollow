import { Events, VaultState } from "./type";
import { VaultItem } from "@type/VaultItem";
import { Storage } from "@managers/Storage";
import { join } from "@tauri-apps/api/path";
import { hollow } from "../../../hollow";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentRealm } from "@shared/managers/Realm";
import { vault_add, vault_add_url, vault_remove } from "@rust";

let store: Storage | null = null;
let dispatch: ((action: any) => void) | null = null;

export async function setupVault(d: (action: any) => void) {
	dispatch = d;
	const path = await join(
		...[getCurrentRealm().location, ".hollow", "vault.json"],
	);
	store = await Storage.create({
		path,
		options: {
			defaults: { __root__: [] },
		},
	});

	dispatch({
		domain: "vault",
		type: "set-items",
		items: store.get("__root__"),
	});
}

export async function vaultEffects(action: Events, state: VaultState) {
	if (action.domain !== "vault") return;

	// Sync to storage
	if (
		["set-items", "add-items", "remove-items", "edit-item"].includes(
			action.type,
		)
	) {
		store?.set("__root__", state.items);
	}

	switch (action.type) {
		case "add-url-item": {
			const { image, name } = action;
			try {
				const removeAlert = hollow.events.emit("alert", {
					type: "loading",
					title: "Loading",
					message: "Downloading...",
				});
				const path = await vault_add_url({
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

				dispatch!({
					domain: "vault",
					type: "add-items",
					items: [urlItem],
				});

				hollow.events.emit("alert", {
					type: "success",
					title: "Vault",
					message: `added 1 image`,
				});
			} catch {
				hollow.events.emit("alert", {
					type: "error",
					title: "Vault",
					message: `Failed to add 1 image`,
				});
			}
			break;
		}
		case "add-items": {
			// TODO
			// This action is overloaded. It can be triggered by UI to add files (which needs rust call)
			// OR it can be triggered by add-url-item success (which already has the item).
			// Wait, the original addItems took string[] (paths) and did rust.vault_add.
			// The reducer takes VaultItem[].
			// We need a separate action for "request to add files from paths".
			// Let's assume the UI calls a different action or we handle it here.
			// Actually, let's look at how addItems was used.
			// It took images: string[].
			// So we need an action "import-files" or similar.
			// But since I already defined add-items as taking VaultItem[], I should probably add a new action "import-items"
			// OR handle the logic before dispatching add-items.
			// But effects handle side effects.
			// Let's add "import-items" to type.ts later if needed.
			// For now, I'll implement the logic for a new action "import-files" here and update type.ts.
			break;
		}
		case "remove-items": {
			const { paths } = action;
			if (paths.length > 0) {
				const targetFiles = paths
					.filter((i) => !i.startsWith("https"))
					.map((i) => getNameFromPath(i));
				void (await vault_remove({
					names: targetFiles,
				}));
			}
			break;
		}
	}
}

// Helper for importing files (was addItems in original manager)
export async function importFiles(images: string[]) {
	if (images.length > 0) {
		const addedImagesPaths: string[] = await vault_add({
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
		hollow.events.emit("character-add-achievement", "🎨 Aesthetic Choice");

		dispatch!({
			domain: "vault",
			type: "add-items",
			items: asVaultItems,
		});
	}
}

export async function importFileUrl(image: string, name?: string) {
	try {
		const removeAlert = hollow.events.emit("alert", {
			type: "loading",
			title: "Loading",
			message: "Downloading...",
		});
		const path = await this.managers?.rust.vault_add_url({
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
		dispatch!({
			domain: "vault",
			type: "add-items",
			items: urlItem,
		});
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
function getNameFromPath(filePath: string): string {
	const parts = filePath.split(/[/\\]/);
	return parts[parts.length - 1];
}
