import EmojiIcon from "@assets/icons/mood-smile.svg";
import {
	createSignal,
	For,
	Show,
	createMemo,
	createEffect,
	onCleanup,
	onMount,
} from "solid-js";
import { SearchIcon } from "lucide-solid";
import PopupWrapper from "../../layout-ui/PopupWrapper";
import { hollow } from "hollow";

type EmojiPickerProps = {
	p: { emoji: string; setEmoji: (e: string) => void };
};

export default function EmojiPicker({ p }: EmojiPickerProps) {
	const [miEmoji, setMiEmoji] = createSignal(p.emoji);
	const [search, setSearch] = createSignal("");
	const [emojiData, setEmojiData] = createSignal<any[]>([]);
	const [loadedChunks, setLoadedChunks] = createSignal(0);
	const [isLoading, setIsLoading] = createSignal(false);
	const [limit, setLimit] = createSignal(50);
	const chunks = import.meta.glob("@assets/emojis/chunk-*.json");
	const chunkKeys = Object.keys(chunks).sort((a, b) => {
		const numA = parseInt(a.match(/chunk-(\d+)\.json/)[1]);
		const numB = parseInt(b.match(/chunk-(\d+)\.json/)[1]);
		return numA - numB;
	});

	const loadNextChunk = async () => {
		if (isLoading() || loadedChunks() >= chunkKeys.length) return;
		setIsLoading(true);
		try {
			const key = chunkKeys[loadedChunks()];
			const module: any = await chunks[key]();
			setEmojiData((prev) => [...prev, ...module.default]);
			setLoadedChunks((prev) => prev + 1);
		} finally {
			setIsLoading(false);
		}
	};

	const loadAllChunks = async () => {
		if (loadedChunks() >= chunkKeys.length) return;
		setIsLoading(true);
		try {
			const remainingKeys = chunkKeys.slice(loadedChunks());
			const modules = await Promise.all(
				remainingKeys.map((key) => chunks[key]()),
			);
			const newEmojis = modules.flatMap((m: any) => m.default);
			setEmojiData((prev) => [...prev, ...newEmojis]);
			setLoadedChunks(chunkKeys.length);
		} finally {
			setIsLoading(false);
		}
	};

	const onScroll = (e) => {
		const div = e.currentTarget as HTMLDivElement;
		if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
			if (limit() < filteredData().length) {
				setLimit((l) => l + 50);
			} else if (!search().length) {
				loadNextChunk();
			}
		}
	};
	createEffect(() => {
		if (search().length > 0) {
			loadAllChunks();
		}
	});

	const filteredData = createMemo(() => {
		const s = search().toLowerCase();
		setLimit(50);
		return emojiData().filter((i) =>
			i.tags?.some((tag: string) => tag.toLowerCase().includes(s)),
		);
	});

	const displayedData = createMemo(() => filteredData().slice(0, limit()));

	const onSave = () => {
		p.setEmoji(miEmoji());
		hollow.events.emit("emoji-picker", null);
	};
	const onCancel = () => {
		p.setEmoji(p.emoji);
		hollow.events.emit("emoji-picker", null);
	};

	onMount(() => {
		if (loadedChunks() === 0) {
			loadNextChunk();
		}
	});
	return (
		<PopupWrapper Icon={EmojiIcon} title="Emoji Picker">
			<div class="emoji-picker flex flex-col gap-3 px-5 pb-5">
				<div class="flex w-full gap-2">
					<div class="bg-secondary-10/70 flex items-center rounded">
						<span class="flex size-12 shrink-0 items-center justify-center text-center text-2xl">
							{miEmoji()}
						</span>
					</div>
					<div class="relative flex-1">
						<input
							class="input bg-secondary-10/70 peer focus:bg-secondary-10 h-fit w-full text-sm transition-all duration-200"
							style={{
								"--border-w": "0px",
								"--padding-y": "calc(var(--spacing) * 3.5)",
								"--padding-x":
									"calc(var(--spacing) * 10) calc(var(--spacing) * 3)",
								"--bg-color": "var(--color-secondary-10)",
							}}
							placeholder="Search emojis..."
							oninput={(e) => setSearch(e.currentTarget.value)}
						/>
						<SearchIcon class="text-secondary-30 peer-focus:text-secondary-90 absolute top-1/2 left-3 w-5 -translate-y-1/2 transition-colors" />
					</div>
				</div>
				<Show
					when={emojiData().length > 0}
					fallback={
						<div class="flex h-80 w-100 items-center justify-center">
							<div class="chaotic-orbit" />
						</div>
					}
				>
					<div class="border-secondary-20 border-t border-b border-dashed">
						<div
							class="flex h-80 w-100 flex-wrap justify-center gap-1 overflow-hidden overflow-y-scroll p-1"
							onscroll={onScroll}
						>
							<For each={displayedData().map((i) => i.unicode)}>
								{(i) => (
									<span
										class="hover:bg-secondary-15 size-fit cursor-pointer rounded p-1 text-3xl"
										onclick={() => setMiEmoji(i)}
									>
										{i}
									</span>
								)}
							</For>
							<Show when={isLoading()}>
								<div class="flex w-full justify-center p-2">
									<div class="chaotic-orbit size-4" />
								</div>
							</Show>
						</div>
					</div>
				</Show>

				<div class="flex w-full justify-around gap-3">
					<button
						onclick={onSave}
						class="button primary"
						style={{ "--w": "100%" }}
					>
						Save
					</button>
					<button
						onclick={onCancel}
						class="button secondary"
						style={{ "--w": "100%" }}
					>
						Cancel
					</button>
				</div>
			</div>
		</PopupWrapper>
	);
}
