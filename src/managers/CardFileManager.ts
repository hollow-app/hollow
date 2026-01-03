import { invoke } from "@tauri-apps/api/core";
import { Managers } from ".";

type PathProps = {
	toolName: string;
	cardName: string;
	path?: string;
};

export class CardFileManager {
	async mkdir(props: PathProps) {
		await invoke("card_mkdir", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}

	async readDir(props: PathProps) {
		return await invoke("card_read_dir", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}

	async readFile(props: PathProps) {
		return await invoke("card_read_file", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}

	async writeFile(props: PathProps & { contents: string }) {
		await invoke("card_write_file", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
			contents: props.contents,
		});
	}

	async rename(props: PathProps & { newPath: string }) {
		await invoke("card_rename", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
			newPath: props.newPath,
		});
	}

	async remove(props: PathProps) {
		await invoke("card_remove", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}

	async exists(props: PathProps) {
		return await invoke("card_exists", {
			toolName: props.toolName,
			cardName: props.cardName,
			path: props.path || "",
		});
	}
}
