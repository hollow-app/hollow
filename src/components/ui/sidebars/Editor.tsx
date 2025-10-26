import Sidepanel from "@components/animations/Sidepanel";
import ColorPick from "@components/ColorPick";
import DropDown from "@components/DropDown";
import NumberInput from "@components/NumberInput";
import { EditorKitType } from "@type/EditorKitType";
import { TentTreeIcon } from "lucide-solid";
import PenRulerIcon from "@assets/icons/pen-ruler.svg";
import {
	Accessor,
	createMemo,
	createSignal,
	onCleanup,
	onMount,
	Setter,
	Show,
} from "solid-js";
import { hollow } from "hollow";

type EditorProps = {
	isVisible: Accessor<boolean>;
	setVisible: Setter<boolean>;
};

export default function Editor({ isVisible, setVisible }: EditorProps) {
	const [kit, setKit] = createSignal<EditorKitType>(null);

	const onSave = () => {
		kit().save();
		hollow.events.emit("editor", null);
	};

	const onCancel = () => {
		kit().setIt(kit().it);
		hollow.events.emit("editor", null);
	};

	const selectCard = (tool: string, card: string) => {
		setKit(
			hollow.toolManager.getEditorKit(tool.toLowerCase(), card.trim()),
		);
	};
	const toggle = (v: any) => {
		setKit(v);
		setVisible((prev) => !prev);
	};
	onMount(() => {
		hollow.events.on("editor", toggle);
	});
	onCleanup(() => {
		hollow.events.off("editor", toggle);
	});
	return (
		<Sidepanel isVisible={isVisible}>
			<div class="px-5 py-3">
				<Header selectCard={selectCard} />
			</div>
			<Show
				when={kit()}
				fallback={
					<div class="flex h-full w-full items-center justify-center">
						<div class="text-secondary-20 animate-pulse">
							<TentTreeIcon class="mx-auto size-10" />
							<span>SELECT A CARD</span>
						</div>
					</div>
				}
			>
				<>
					<div class="h-full max-h-full overflow-hidden overflow-y-scroll pr-3 pl-[calc(var(--spacing)*3+8px)] text-gray-950 dark:text-gray-50">
						<h1 class="mt-5 text-2xl font-bold">Size</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<div class="flex items-center justify-between">
								<h3>Width</h3>
								<div class="w-70 max-w-[50%]">
									<NumberInput
										value={kit().it.width}
										setValue={(v) =>
											kit().setIt((prev) => ({
												...prev,
												width: v,
											}))
										}
										direct
									/>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<h3>Height</h3>
								<div class="w-70 max-w-[50%]">
									<NumberInput
										value={kit().it.height}
										setValue={(v) =>
											kit().setIt((prev) => ({
												...prev,
												height: v,
											}))
										}
										direct
									/>
								</div>
							</div>
						</div>
						<h1 class="mt-4 text-2xl font-bold">Appearance</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<div class="flex items-center justify-between">
								<h3>Corner</h3>
								<div class="w-70 max-w-[50%]">
									<NumberInput
										value={kit().it.corner}
										setValue={(v) =>
											kit().setIt((prev) => ({
												...prev,
												corner: v,
											}))
										}
										direct
									/>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<h3>Opacity</h3>
								<div class="w-70 max-w-[50%]">
									<NumberInput
										value={kit().it.opacity}
										setValue={(v) =>
											kit().setIt((prev) => ({
												...prev,
												opacity: v,
											}))
										}
										step={0.1}
										max={1}
										direct
									/>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<h3>Border</h3>
								<div class="flex w-[60%] items-center justify-end gap-1">
									<ColorPick
										color={() => kit().it.border.c}
										setColor={(v) =>
											kit().setIt((prev) => ({
												...prev,
												border: {
													...prev.border,
													c: v,
												},
											}))
										}
									/>
									<div class="w-70 max-w-[90%]">
										<NumberInput
											value={kit().it.border.n}
											setValue={(v) =>
												kit().setIt((prev) => ({
													...prev,
													border: {
														...prev.border,
														n: v,
													},
												}))
											}
											direct
										/>
									</div>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<h3>Glass</h3>
								<div class="toggle-switch">
									<input
										class="toggle-input"
										id="editor-glass-toggle"
										type="checkbox"
										checked={kit().it.glass}
										onclick={(e) =>
											kit().setIt((prev) => ({
												...prev,
												glass: e.currentTarget.checked,
											}))
										}
									/>
									<label
										class="toggle-label"
										for="editor-glass-toggle"
									></label>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<h3>Shadow</h3>
								<div class="toggle-switch">
									<input
										class="toggle-input"
										id="editor-shadow-toggle"
										type="checkbox"
										checked={kit().it.shadow}
										onclick={(e) =>
											kit().setIt((prev) => ({
												...prev,
												shadow: e.currentTarget.checked,
											}))
										}
									/>
									<label
										class="toggle-label"
										for="editor-shadow-toggle"
									></label>
								</div>
							</div>
						</div>
						<h1 class="mt-4 text-2xl font-bold">Position</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<div class="flex items-center justify-between">
								<h3>X</h3>
								<div class="w-70 max-w-[50%]">
									<NumberInput
										value={kit().it.xyz.x}
										setValue={(n) =>
											kit().setIt((prev) => ({
												...prev,
												xyz: { ...prev.xyz, x: n },
											}))
										}
										direct
									/>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<h3>Y</h3>
								<div class="w-70 max-w-[50%]">
									<NumberInput
										value={kit().it.xyz.y}
										setValue={(n) =>
											kit().setIt((prev) => ({
												...prev,
												xyz: { ...prev.xyz, y: n },
											}))
										}
										direct
									/>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<h3>Z</h3>
								<div class="w-70 max-w-[50%]">
									<NumberInput
										value={kit().it.xyz.z}
										setValue={(n) =>
											kit().setIt((prev) => ({
												...prev,
												xyz: { ...prev.xyz, z: n },
											}))
										}
										direct
									/>
								</div>
							</div>
						</div>
					</div>

					<div class="mt-2 flex min-h-20 w-full gap-4 pr-3 pl-[calc(var(--spacing)*3+8px)]">
						<button class="button-primary" onclick={onSave}>
							Save
						</button>
						<button class="button-secondary" onclick={onCancel}>
							Cancel
						</button>
					</div>
				</>
			</Show>
		</Sidepanel>
	);
}

type HeaderProps = {
	selectCard: (tool: string, card: string) => void;
};
function Header({ selectCard }: HeaderProps) {
	const [selected, setSelected] = createSignal({ tool: null, card: null });
	const cards = createMemo<string[]>(() =>
		selected().tool
			? hollow.toolManager
					.getHand()
					.find((i) => i.name === selected().tool)
					.cards.map((i) => i.name)
			: [],
	);

	return (
		<div class="bg-secondary-05/50 border-secondary-10 flex h-fit w-full gap-2 rounded-lg border p-4">
			<div class="flex-1 space-y-1">
				<h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
					Editor
				</h1>
				<div class="flex gap-2">
					<DropDown
						items={() =>
							hollow.toolManager.getHand().map((i) => i.name)
						}
						value={() => selected().tool}
						onSelect={(v) => setSelected({ tool: v, card: null })}
						placeholder="--tool--"
						style={{ "--w": "50%" }}
					/>
					<DropDown
						items={cards}
						value={() => selected().card}
						onSelect={(v) => {
							setSelected((prev) => ({ ...prev, card: v }));
							selectCard(selected().tool, selected().card);
						}}
						placeholder="--card--"
						style={{ "--w": "50%" }}
					/>
				</div>
			</div>
		</div>
	);
}
