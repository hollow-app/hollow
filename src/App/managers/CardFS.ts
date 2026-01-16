import { invoke } from "@tauri-apps/api/core";

type PathProps = {
	toolName: string;
	cardName: string;
	path?: string;
};

export type CardDirEntry = {
	name: string;
	is_dir: boolean;
};

export async function mkdir(props: PathProps): Promise<void> {
	await invoke("card_mkdir", {
		toolName: props.toolName,
		cardName: props.cardName,
		path: props.path || "",
	});
}

export async function readDir(props: PathProps): Promise<CardDirEntry[]> {
	return await invoke<CardDirEntry[]>("card_read_dir", {
		toolName: props.toolName,
		cardName: props.cardName,
		path: props.path || "",
	});
}

export async function readFile(props: PathProps): Promise<string> {
	return await invoke<string>("card_read_file", {
		toolName: props.toolName,
		cardName: props.cardName,
		path: props.path || "",
	});
}

export async function writeFile(
	props: PathProps & { contents: string },
): Promise<void> {
	await invoke("card_write_file", {
		toolName: props.toolName,
		cardName: props.cardName,
		path: props.path || "",
		contents: props.contents,
	});
}

export async function rename(
	props: PathProps & { newPath: string },
): Promise<void> {
	await invoke("card_rename", {
		toolName: props.toolName,
		cardName: props.cardName,
		path: props.path || "",
		newPath: props.newPath,
	});
}

export async function remove(props: PathProps): Promise<void> {
	await invoke("card_remove", {
		toolName: props.toolName,
		cardName: props.cardName,
		path: props.path || "",
	});
}

export async function exists(props: PathProps): Promise<boolean> {
	return await invoke<boolean>("card_exists", {
		toolName: props.toolName,
		cardName: props.cardName,
		path: props.path || "",
	});
}
