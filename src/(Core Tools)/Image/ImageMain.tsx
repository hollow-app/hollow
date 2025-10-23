import { DataBase, HollowEvent, ICard, IPlugin } from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";
import { ImageManager } from "./ImageManager";
import { ImageType } from "./ImageType";

const Image = lazy(() => import("./Image"));

export class ImageMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();

	async onCreate(name: string): Promise<boolean> {
		await ImageManager.getSelf().saveImage({
			id: name,
			url: "",
			caption: "",
			alt: "",
			objectFit: "contain",
			position: { x: 50, y: 50 },
		});
		return true;
	}

	async onDelete(name: string): Promise<boolean> {
		await ImageManager.getSelf().removeImage(name);
		return true;
	}

	async onLoad(card: ICard, app?: HollowEvent): Promise<boolean> {
		const targetContainer = document.getElementById(card.containerID);
		const data: ImageType = await ImageManager.getSelf().getImage(
			card.name,
		);

		if (targetContainer && !this.roots.has(card.name)) {
			const dispose = createRoot((dispose) => {
				render(
					() => <Image card={card} app={app} data={data} />,
					targetContainer,
				);
				return dispose;
			});

			this.roots.set(card.name, dispose);
		}

		return true;
	}

	onUnload(name: string): void {
		const dispose = this.roots.get(name);
		if (dispose) {
			dispose();
			this.roots.delete(name);
		}
	}
}
