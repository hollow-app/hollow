import { invoke } from "@tauri-apps/api/core";
import { Managers } from ".";

type PathProps = {
	toolName: string;
	cardName: string;
	path?: string;
};

export type CardDirEntry = {
	name: string;
	is_dir: boolean;
};

export class CardFileManager {
	async mkdir(props: PathProps): Promise<void> {
		await invoke("card_mkdir", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}

	async readDir(props: PathProps): Promise<CardDirEntry[]> {
		return await invoke<CardDirEntry[]>("card_read_dir", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}

	async readFile(props: PathProps): Promise<string> {
		return await invoke<string>("card_read_file", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}

	async writeFile(props: PathProps & { contents: string }): Promise<void> {
		await invoke("card_write_file", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
			contents: props.contents,
		});
	}

	async rename(props: PathProps & { newPath: string }): Promise<void> {
		await invoke("card_rename", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
			newPath: props.newPath,
		});
	}

	async remove(props: PathProps): Promise<void> {
		await invoke("card_remove", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}

	async exists(props: PathProps): Promise<boolean> {
		return await invoke<boolean>("card_exists", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}
}
