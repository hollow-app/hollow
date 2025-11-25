import Sidepanel from "@components/animations/Sidepanel";
import ColorPick from "@components/ColorPick";
import NumberInput from "@components/NumberInput";
import { TentTreeIcon } from "lucide-solid";
import {
	createMemo,
	createSignal,
	onCleanup,
	onMount,
	Show,
	type Accessor,
	type Setter,
} from "solid-js";
import { hollow } from "hollow";
import Dropdown from "@components/Dropdown";
import type { Opthand } from "@type/Opthand";

type EditorProps = {
	isVisible: Accessor<boolean>;
	setVisible: Setter<boolean>;
};

interface SelectedCard {
	tool: string;
	cardId: string;
}

export default function Editor({ isVisible, setVisible }: EditorProps) {
	const [selectedCard, setSelectedCard] = createSignal<SelectedCard>({
		tool: "",
		cardId: "",
	});

	let initialState: Opthand | null = null;

	const cardData = createMemo(() => {
		const id = selectedCard().cardId;
		return id ? hollow.group()[id] : null;
	});
	const cardStyle = createMemo(() => cardData()?.style ?? {});

	const updateRootProp = (key: keyof Opthand, value: any) => {
		const id = selectedCard().cardId;
		hollow.setGroup(id, key, value);
	};

	const updateStyleProp = (key: string, value: any) => {
		const id = selectedCard().cardId;
		hollow.setGroup(id, "style", key, value);
	};

	const selectCard = (payload: SelectedCard) => {
		if (!payload.cardId) return;

		if (selectedCard().cardId === payload.cardId) return;

		const data = hollow.group()[payload.cardId];
		if (!data) return;

		initialState = data;
		setSelectedCard(payload);
	};

	const toggleEditor = (v: SelectedCard) => {
		setSelectedCard(v);
		setVisible((current) => !current);
	};

	const onSave = () => {
		const id = selectedCard().cardId;
		const { tool, ...rest } = hollow.group()[id];
		hollow.toolManager.setCard(selectedCard().tool, id, rest);
		hollow.events.emit("editor", null);
	};

	const onCancel = () => {
		if (initialState) {
			hollow.setGroup(selectedCard().cardId, initialState);
		}
		hollow.events.emit("editor", null);
	};

	onMount(() => hollow.pevents.on("editor", toggleEditor));
	onCleanup(() => hollow.pevents.off("editor", toggleEditor));

	return (
		<Sidepanel isVisible={isVisible}>
			<div class="px-5 py-3">
				<Show when={isVisible()}>
					<Header selected={selectedCard} selectCard={selectCard} />
				</Show>
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
					<div class="h-full max-h-full overflow-y-scroll pr-3 pl-[calc(var(--spacing)*3+8px)] text-gray-950 dark:text-gray-50">
						<h1 class="mt-5 text-2xl font-bold">Size</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<NumRow
								label="Width"
								value={() => cardData().width}
								setValue={(v) => updateRootProp("width", v)}
							/>
							<NumRow
								label="Height"
								value={() => cardData().height}
								setValue={(v) => updateRootProp("height", v)}
							/>
						</div>

						<h1 class="mt-4 text-2xl font-bold">Appearance</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<NumRow
								label="Corner"
								value={() => cardStyle()["border-radius"]}
								setValue={(v) =>
									updateStyleProp("border-radius", v)
								}
							/>

							<NumRow
								label="Opacity"
								value={() => cardStyle().opacity}
								setValue={(v) => updateStyleProp("opacity", v)}
								step={0.1}
								max={1}
							/>

							<div class="flex items-center justify-between">
								<h3>Border</h3>
								<div class="flex w-[60%] items-center justify-end gap-1">
									<ColorPick
										color={() =>
											cardStyle()["outline-color"]
										}
										setColor={(v) =>
											updateStyleProp("outline-color", v)
										}
									/>
									<div class="w-70 max-w-[90%]">
										<NumberInput
											value={() =>
												cardStyle()["outline-width"]
											}
											setValue={(v) =>
												updateStyleProp(
													"outline-width",
													v,
												)
											}
											direct
										/>
									</div>
								</div>
							</div>

							<ToggleRow
								label="Glass"
								checked={() =>
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
								checked={() => cardStyle().shadow !== "none"}
								onToggle={(on) =>
									updateStyleProp(
										"shadow",
										on ? "var(--shadow-sm)" : "none",
									)
								}
							/>
						</div>

						<h1 class="mt-4 text-2xl font-bold">Position</h1>
						<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
							<NumRow
								label="X"
								value={() => cardData().x}
								setValue={(v) => updateRootProp("x", v)}
							/>
							<NumRow
								label="Y"
								value={() => cardData().y}
								setValue={(v) => updateRootProp("y", v)}
							/>
							<NumRow
								label="Z"
								value={() => cardStyle().z}
								setValue={(v) => updateStyleProp("z", v)}
							/>
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

function NumRow(props: {
	label: string;
	value: Accessor<number>;
	setValue: (v: number) => void;
	step?: number;
	max?: number;
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
					direct
				/>
			</div>
		</div>
	);
}

function ToggleRow(props: {
	label: string;
	checked: Accessor<boolean>;
	onToggle: (on: boolean) => void;
}) {
	return (
		<div class="flex items-center justify-between">
			<h3>{props.label}</h3>
			<div class="toggle-switch">
				<input
					class="toggle-input"
					type="checkbox"
					checked={props.checked()}
					onclick={(e) => props.onToggle(e.currentTarget.checked)}
				/>
				<label class="toggle-label" />
			</div>
		</div>
	);
}

function Header(props: {
	selected: Accessor<SelectedCard>;
	selectCard: (v: SelectedCard) => void;
}) {
	const [toolName, setToolName] = createSignal("");

	const cardList = createMemo(() => {
		if (!toolName()) return [];
		const tool = hollow.toolManager
			.getHand()
			.find((t) => t.name === toolName());
		return tool?.cards.filter((c) => c.isPlaced).map((c) => c.name) ?? [];
	});

	return (
		<div class="bg-secondary-05/50 border-secondary-10 flex h-fit w-full gap-2 rounded-lg border p-4">
			<div class="flex-1 space-y-1">
				<h1 class="text-xl font-bold">Editor</h1>
				<div class="flex gap-2">
					<Dropdown
						value={toolName}
						onSelect={setToolName}
						options={() => [
							{
								items: hollow.toolManager
									.getHand()
									.map((t) => t.name),
							},
						]}
						placeholder="Tool"
					/>

					<Dropdown
						value={() => props.selected().cardId}
						onSelect={(id) =>
							props.selectCard({
								tool: toolName(),
								cardId: id,
							})
						}
						options={() => [{ items: cardList() }]}
						placeholder="Card"
					/>
				</div>
			</div>
		</div>
	);
}
