import { ImageType } from "./ImageType";

export class ImageManager {
	private dbPromise: Promise<IDBDatabase> | null = null;
	private static self: ImageManager;

	static getSelf() {
		if (!this.self) {
			this.self = new ImageManager();
		}
		return this.self;
	}

	constructor() {
		this.dbPromise = this.openDB();
	}

	private openDB(): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open("imageDB", 1);

			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains("images")) {
					db.createObjectStore("images", { keyPath: "id" });
				}
			};

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async getImage(imageId: string): Promise<ImageType | null> {
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db!.transaction("images", "readonly");
			const store = tx.objectStore("images");
			const request = store.get(imageId);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	async saveImage(image: ImageType): Promise<void> {
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db!.transaction("images", "readwrite");
			const store = tx.objectStore("images");
			store.put(image);
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject(tx.error);
		});
	}

	async removeImage(imageId: string): Promise<void> {
		const db = await this.dbPromise;
		return new Promise((resolve, reject) => {
			const tx = db!.transaction("images", "readwrite");
			const store = tx.objectStore("images");
			const request = store.delete(imageId);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
}
