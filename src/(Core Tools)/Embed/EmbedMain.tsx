import {
	AppEvents,
	DataBase,
	DataBaseRequest,
	HollowEvent,
	ICard,
	IPlugin,
	IStore,
	ToolEvents,
} from "@type/hollow";
import { render } from "solid-js/web";
import { createRoot } from "solid-js";
import { lazy } from "solid-js";

const Embed = lazy(() => import("./Embed"));

export type EmbedData = {
	src: string;
};

export class EmbedMain implements IPlugin {
	private roots: Map<string, () => void> = new Map();
	private store: IStore = null;

	constructor(toolEvent: HollowEvent<ToolEvents>) {
		this.store = toolEvent.getCurrentData("config");
	}

	async onCreate(card: ICard): Promise<boolean> {
		this.store.set(card.id, { src: null });
		return true;
	}

	async onDelete(card: ICard): Promise<boolean> {
		this.store.remove(card.id);
		return true;
	}

	async onLoad(card: ICard): Promise<boolean> {
		const data: EmbedData = this.store.get(card.id);
		const targetContainer = document.getElementById(card.id);
		if (targetContainer && !this.roots.has(card.id)) {
			const dispose = createRoot((dispose) => {
				render(
					() => <Embed data={data} store={this.store} card={card} />,
					targetContainer,
				);
				return dispose;
			});
			this.roots.set(card.id, dispose);
		}
		return true;
	}

	onUnload(id: string): void {
		const dispose = this.roots.get(id);
		if (dispose) {
			dispose();
			this.roots.delete(id);
		}
	}
}
