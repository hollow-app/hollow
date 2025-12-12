import ColorPick from "@components/dynamic/ColorPick";
import NumberInput from "@components/dynamic/NumberInput";
import { TentTreeIcon } from "lucide-solid";
import {
	createMemo,
	createSignal,
	JSX,
	onMount,
	Show,
	type Accessor,
	type Setter,
} from "solid-js";
import { hollow } from "hollow";
import Dropdown from "@components/dynamic/Dropdown";
import { CardType } from "@type/hollow";
import { unwrap } from "solid-js/store";
import { SettingsManager } from "@managers/SettingsManager";

interface SelectedCard {
	tool: string;
	cardId: string;
}

export default function Editor() {
	const step = createMemo(() => SettingsManager.getSelf().gridSize[0]());
	const [selectedCard, setSelectedCard] = createSignal<SelectedCard>(
		hollow.pevents.getData("editor"),
	);

	const cardData = createMemo(() => {
		if (!selectedCard()) return null;
		const id = selectedCard().cardId;
		return id ? hollow.cards().find((c) => c.id === id) : null;
	});
	let initialState: CardType | null = { ...unwrap(cardData()) };
	const cardStyle = createMemo(() => cardData()?.style ?? {});

	const updateRootProp = (key: keyof CardType, value: any) => {
		const id = selectedCard().cardId;
		hollow.setCards((c) => c.id === id, key, value);
	};

	const updateStyleProp = (key: keyof JSX.CSSProperties, value: any) => {
		const id = selectedCard().cardId;
		hollow.setCards((c) => c.id === id, "style", key, value);
	};

	const selectCard = (payload: SelectedCard) => {
		if (!payload.cardId) return;

		if (selectedCard().cardId === payload.cardId) return;

		const data = hollow.cards().find((i) => i.id === payload.cardId);
		if (!data) return;

		initialState = { ...unwrap(data) };
		setSelectedCard(payload);
	};

	const onSave = () => {
		const id = selectedCard().cardId;
		const card = hollow.cards().find((i) => i.id === id);
		delete card.data.extra.tool;
		hollow.toolManager.updateCard(selectedCard().tool, card);
		hollow.pevents.emit("editor", null);
	};

	const onCancel = () => {
		if (initialState) {
			hollow.setCards(
				(c) => c.id === selectedCard().cardId,
				initialState,
			);
		}
		hollow.pevents.emit("editor", null);
	};
	onMount(() => {
		!initialState && (initialState = unwrap(cardData()));
	});

	return (
		<div class="size-full">
			<div class="px-5 py-3">
				<Header
					selected={selectedCard}
					selectCard={selectCard}
					setSelected={setSelectedCard}
				/>
			</div>

			<Show
				when={cardData()}
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
					<div class="max-h-full overflow-y-scroll pr-3 pl-[calc(var(--spacing)*3+8px)] text-gray-950 dark:text-gray-50">
						<h1 class="mt-5 text-2xl font-bold">Size</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<NumRow
								label="Width"
								value={cardData().width}
								step={step()}
								setValue={(v) => updateRootProp("width", v)}
							/>
							<NumRow
								label="Height"
								value={cardData().height}
								step={step()}
								setValue={(v) => updateRootProp("height", v)}
							/>
						</div>

						<h1 class="mt-4 text-2xl font-bold">Appearance</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<NumRow
								label="Corner"
								value={Number(
									cardStyle()
										["border-radius"].toString()
										.split("px")[0],
								)}
								setValue={(v) =>
									updateStyleProp("border-radius", v + "px")
								}
							/>

							<NumRow
								label="Opacity"
								value={Number(
									(cardStyle()["--opacity"] ?? "100%")
										.toString()
										.split("%")[0],
								)}
								setValue={(v) =>
									updateStyleProp("--opacity", `${v}%`)
								}
								step={5}
								max={100}
							/>

							<div class="flex items-center justify-between">
								<h3>Border</h3>
								<div class="flex w-[60%] items-center justify-end gap-1">
									<ColorPick
										color={cardStyle()["outline-color"]}
										setColor={(v) =>
											updateStyleProp("outline-color", v)
										}
									/>
									<div class="w-70 max-w-[90%]">
										<NumberInput
											value={Number(
												cardStyle()
													["outline-width"].toString()
													.split("px")[0],
											)}
											setValue={(v) =>
												updateStyleProp(
													"outline-width",
													v + "px",
												)
											}
											direct
										/>
									</div>
								</div>
							</div>

							<ToggleRow
								label="Glass"
								checked={
									cardStyle()["backdrop-filter"] !== "none"
								}
								onToggle={(on) =>
									updateStyleProp(
										"backdrop-filter",
										on ? "blur(var(--blur-sm))" : "none",
									)
								}
							/>

							<ToggleRow
								label="Shadow"
								checked={cardStyle()["box-shadow"] !== "none"}
								onToggle={(on) =>
									updateStyleProp(
										"box-shadow",
										on ? "var(--shadow-sm)" : "none",
									)
								}
							/>
						</div>

						<h1 class="mt-4 text-2xl font-bold">Position</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<NumRow
								label="X"
								value={cardData().x}
								setValue={(v) => updateRootProp("x", v)}
								step={step()}
								min={-10000}
							/>
							<NumRow
								label="Y"
								value={cardData().y}
								setValue={(v) => updateRootProp("y", v)}
								step={step()}
								min={-10000}
							/>
							<NumRow
								label="Z"
								value={Number(cardStyle()["z-index"] ?? 0)}
								setValue={(v) => updateStyleProp("z-index", v)}
							/>
						</div>
					</div>

					<div class="mt-2 flex h-fit min-h-20 w-full gap-4 pr-3 pl-[calc(var(--spacing)*3+8px)]">
						<button class="button-primary" onclick={onSave}>
							Save
						</button>
						<button class="button-secondary" onclick={onCancel}>
							Cancel
						</button>
					</div>
				</>
			</Show>
		</div>
	);
}

function NumRow(props: {
	label: string;
	value: number;
	setValue: (v: number) => void;
	step?: number;
	max?: number;
	min?: number;
}) {
	return (
		<div class="flex items-center justify-between">
			<h3>{props.label}</h3>
			<div class="w-70 max-w-[50%]">
				<NumberInput
					value={props.value}
					setValue={props.setValue}
					step={props.step}
					max={props.max}
					min={props.min}
					direct
				/>
			</div>
		</div>
	);
}

function ToggleRow(props: {
	label: string;
	checked: boolean;
	onToggle: (on: boolean) => void;
}) {
	const id = crypto.randomUUID();
	return (
		<div class="flex items-center justify-between">
			<h3>{props.label}</h3>
			<div class="toggle-switch">
				<input
					class="toggle-input"
					type="checkbox"
					id={`${id}-toggle`}
					checked={props.checked}
					onclick={(e) => props.onToggle(e.currentTarget.checked)}
				/>
				<label class="toggle-label" for={`${id}-toggle`} />
			</div>
		</div>
	);
}

function Header(props: {
	selected: Accessor<SelectedCard>;
	setSelected: Setter<SelectedCard>;
	selectCard: (v: SelectedCard) => void;
}) {
	const cardList = createMemo<{ name: string; id: string }[]>(() => {
		if (!props.selected()) return [];
		const toolName = props.selected().tool;
		if (!toolName) return [];
		const tool = hollow.toolManager
			.getHand()
			.find((t) => t.name === toolName);
		return (
			tool?.cards
				.filter((c) => c.data.extra.isPlaced)
				.map((c) => ({ name: c.data.extra.name, id: c.id })) ?? []
		);
	});

	return (
		<div class="border-secondary-10 flex h-fit w-full gap-2">
			<div class="flex-1 space-y-1">
				<div class="flex gap-2">
					<Dropdown
						value={props.selected()?.tool ?? ""}
						onSelect={(v) =>
							props.setSelected({ tool: v, cardId: null })
						}
						options={[
							{
								items: hollow.toolManager
									.getHand()
									.map((t) => t.name),
							},
						]}
						placeholder="Tool"
					/>

					<Dropdown
						value={
							cardList().find(
								(c) => c.id === props.selected().cardId,
							)?.name ?? ""
						}
						onSelect={(n) => {
							if (!props.selected()) return;
							props.selectCard({
								tool: props.selected().tool,
								cardId: cardList().find((c) => c.name === n).id,
							});
						}}
						options={[{ items: cardList().map((i) => i.name) }]}
						placeholder="Card"
					/>
				</div>
			</div>
		</div>
	);
}
