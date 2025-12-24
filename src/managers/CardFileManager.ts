import {
	readDir,
	readTextFile,
	remove,
	exists,
	mkdir,
	writeTextFile,
	readFile,
	rename,
} from "@tauri-apps/plugin-fs";
import { Managers } from ".";

type PathProps = {
	toolName: string;
	cardName: string;
	path?: string;
};

export class CardFileManager {
	private readonly managers: Managers;
	constructor(managers: Managers) {
		this.managers = managers;
	}
	private realmLocation() {
		return this.managers?.realm.getCurrent().location;
	}

	private resolvePath({ toolName, cardName, path = "" }: PathProps): string {
		if (!this.realmLocation()) throw new Error("Realm path not set");

		const basePath = `${this.realmLocation()}/main/${toolName}/${cardName}`;
		const normalized = path
			.replace(/\\/g, "/")
			.replace(/\/+/g, "/")
			.replace(/(^\/|\/$)/g, "");

		const full = `${basePath}/${normalized}`;
		const resolved = full.split("/").reduce<string[]>((acc, part) => {
			if (part === "..") acc.pop();
			else if (part !== ".") acc.push(part);
			return acc;
		}, []);

		const safePath = resolved.join("/");
		if (!safePath.startsWith(basePath))
			throw new Error(
				"Access denied: Attempted to escape tool/card directory",
			);

		return safePath;
	}

	async mkdir(props: PathProps) {
		const target = this.resolvePath(props);
		await mkdir(target, { recursive: true });
	}

	async readDir(props: PathProps) {
		const target = this.resolvePath(props);
		return await readDir(target);
	}

	async readFile(props: PathProps) {
		const target = this.resolvePath(props);
		return await readTextFile(target);
	}

	async writeFile(props: PathProps & { contents: string }) {
		const target = this.resolvePath(props);
		await writeTextFile(target, props.contents);
	}

	async rename(props: PathProps & { newPath: string }) {
		const oldPath = this.resolvePath(props);
		const newPath = this.resolvePath({ ...props, path: props.newPath });
		await rename(oldPath, newPath);
	}

	async remove(props: PathProps) {
		const target = this.resolvePath(props);
		await remove(target, { recursive: true });
	}

	async exists(props: PathProps) {
		const target = this.resolvePath(props);
		return await exists(target);
	}
}
