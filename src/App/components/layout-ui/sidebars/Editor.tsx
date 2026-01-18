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
import { hollow } from "../../../../hollow";
import Dropdown from "@components/dynamic/Dropdown";
import { CardType } from "@type/hollow";
import { unwrap } from "solid-js/store";
import { useStore } from "@shared/store";
import { getHand } from "@managers/Module/effects";

interface SelectedInstance {
	module: string;
	id: string;
}

export default function Editor() {
	const { state, dispatch } = useStore();
	const instances = createMemo(() => state.module.instances);
	const [instance, setInstance] = createSignal<SelectedInstance>();

	const instanceData = createMemo(() => {
		if (!instance()) return null;
		const id = instance().id;
		return id ? instances().find((c) => c.id === id) : null;
	});
	const instanceStyle = createMemo(() => instanceData()?.style ?? {});

	// updaters
	const updateRootProp = (key: keyof CardType, value: any) => {
		const id = instance().id;
		const module = instance().module;
		dispatch(
			{
				domain: "module",
				type: "update-instance",
				cardId: id,
				toolName: module,
				rect: { [key]: value },
			},
			{ draft: "editor" },
		);
	};

	const updateStyleProp = (key: keyof JSX.CSSProperties, value: any) => {
		const id = instance().id;
		const module = instance().module;
		const currentCard = instances().find((c) => c.id === id);
		if (currentCard) {
			const newStyle = { ...currentCard.style, [key]: value };
			dispatch(
				{
					domain: "module",
					type: "update-instance",
					cardId: id,
					toolName: module,
					updates: { style: newStyle },
				},
				{ draft: "editor" },
			);
		}
	};

	// selector

	const onSave = () => {
		dispatch(
			{
				type: "DRAFT_COMMIT",
			},
			{ draft: "editor" },
		);
		hollow.pevents.emit("editor", null);
	};

	const onCancel = () => {
		dispatch(
			{
				type: "DRAFT_CANCEL",
			},
			{ draft: "editor" },
		);
		hollow.pevents.emit("editor", null);
	};
	onMount(() => {
		// dispatch({
		// 	type: "DRAFT_START",
		// 	path: "module.instances",
		// 	select: { key: "id" },
		// });
	});

	return (
		<div
			id="editor-panel"
			class="flex size-full flex-col overflow-hidden rounded-xl p-5"
		>
			<div class="">
				<Header instance={instance} setInstance={setInstance} />
			</div>

			<Show
				when={instanceData()}
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
					<div class="flex-1 overflow-y-scroll pl-[8px] text-gray-950 dark:text-gray-50">
						<div class="h-fit">
							<h1 class="mt-5 text-2xl font-bold">Size</h1>
							<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
								<NumRow
									label="Width"
									value={instanceData().w}
									step={1}
									min={1}
									setValue={(v) => updateRootProp("w", v)}
								/>
								<NumRow
									label="Height"
									value={instanceData().h}
									step={1}
									min={1}
									setValue={(v) => updateRootProp("h", v)}
								/>
							</div>

							<h1 class="mt-4 text-2xl font-bold">Appearance</h1>
							<div class="bg-secondary-10/50 my-3 flex flex-col gap-3 rounded-lg p-3">
								<NumRow
									label="Corner"
									value={Number(
										instanceStyle()
											["border-radius"]?.toString()
											.split("px")[0] ?? 0,
									)}
									setValue={(v) =>
										updateStyleProp(
											"border-radius",
											v + "px",
										)
									}
								/>

								<NumRow
									label="Opacity"
									value={Number(
										(instanceStyle()["--opacity"] ?? "100%")
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
											color={
												instanceStyle()["border-color"]
											}
											setColor={(v) =>
												updateStyleProp(
													"border-color",
													v,
												)
											}
										/>
										<div class="w-70 max-w-[90%]">
											<NumberInput
												value={Number(
													instanceStyle()
														[
															"border-width"
														]?.toString()
														.split("px")[0] ?? 0,
												)}
												setValue={(v) =>
													updateStyleProp(
														"border-width",
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
										!!instanceStyle()["backdrop-filter"]
									}
									onToggle={(on) =>
										updateStyleProp(
											"backdrop-filter",
											on
												? "blur(var(--blur-sm))"
												: "none",
										)
									}
								/>

								<ToggleRow
									label="Shadow"
									checked={!!instanceStyle()["box-shadow"]}
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
									value={instanceData().x}
									setValue={(v) => updateRootProp("x", v)}
									min={-10000}
								/>
								<NumRow
									label="Y"
									value={instanceData().y}
									setValue={(v) => updateRootProp("y", v)}
									min={-10000}
								/>
							</div>
						</div>

						<div class="mt-2 flex h-fit min-h-20 w-full gap-4 pr-3 pl-[calc(var(--spacing)*3+8px)]">
							<button class="button primary" onclick={onSave}>
								Save
							</button>
							<button class="button secondary" onclick={onCancel}>
								Cancel
							</button>
						</div>
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
	instance: Accessor<SelectedInstance>;
	setInstance: Setter<SelectedInstance>;
}) {
	const { state, dispatch } = useStore();
	const modules = getHand();
	const cardList = createMemo<{ name: string; id: string }[]>(() => {
		if (!props.instance()) return [];
		const toolName = props.instance().module;
		if (!toolName) return [];
		const tool = modules[toolName];
		return (
			tool?.cards
				.filter((c) => c.data.isPlaced)
				.map((c) => ({ name: c.data.name, id: c.id })) ?? []
		);
	});
	const selectCard = (payload: SelectedInstance) => {
		if (!payload.id) return;

		if (props.instance().id === payload.id) return;

		const data = state.module.instances.find((i) => i.id === payload.id);
		if (!data) return;
		props.setInstance(payload);
		dispatch(
			{
				type: "DRAFT_START",
				path: "module.instances",
				select: {
					key: "id",
					value: payload.id,
				},
			},
			{ draft: "editor" },
		);
	};
	onMount(() => {
		// TODO opened by context menu
	});

	return (
		<div class="border-secondary-10 flex flex-col gap-4 border-b pb-4">
			<div class="space-y-1">
				<h2 class="text-lg font-semibold tracking-tight">Editor</h2>
				<p class="text-sm text-neutral-500">
					Manage your card properties and styles.
				</p>
			</div>
			<div class="flex gap-2">
				<div class="flex-1">
					<Dropdown
						value={props.instance()?.module ?? ""}
						onSelect={(v) =>
							props.setInstance({ module: v, id: null })
						}
						options={[
							{
								items: Object.keys(modules),
							},
						]}
						placeholder="Select Tool"
					/>
				</div>

				<div class="flex-1">
					<Dropdown
						value={
							cardList().find((c) => c.id === props.instance().id)
								?.name ?? ""
						}
						onSelect={(n) => {
							if (!props.instance()) return;
							selectCard({
								module: props.instance().module,
								id: cardList().find((c) => c.name === n).id,
							});
						}}
						options={[{ items: cardList().map((i) => i.name) }]}
						placeholder="Select Card"
					/>
				</div>
			</div>
		</div>
	);
}
