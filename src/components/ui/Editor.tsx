import Sidepanel from "@components/animations/Sidepanel";
import ColorPick from "@components/ColorPick";
import DropDown from "@components/DropDown";
import NumberInput from "@components/NumberInput";
import { EditorKitType } from "@type/EditorKitType";
import { PencilRulerIcon, TentTreeIcon } from "lucide-solid";
import {
	Accessor,
	createSignal,
	onCleanup,
	onMount,
	Setter,
	Show,
} from "solid-js";

type EditorProps = {
	isVisible: Accessor<boolean>;
	setVisible: Setter<boolean>;
};

export default function Editor({ isVisible, setVisible }: EditorProps) {
	const [kit, setKit] = createSignal<EditorKitType>(null);

	const onSave = () => {
		kit().save();
		window.hollowManager.emit("editor", null);
	};

	const onCancel = () => {
		kit().setIt(kit().it);
		window.hollowManager.emit("editor", null);
	};

	const selectCard = (v: string) => {
		const [tool, card] = v.split(":");
		setKit(
			window.toolManager.getEditorKit(tool.toLowerCase(), card.trim()),
		);
	};
	const toggle = (v: any) => {
		setKit(v);
		setVisible((prev) => !prev);
	};
	onMount(() => {
		window.hollowManager.on("editor", toggle);
	});
	onCleanup(() => {
		window.hollowManager.off("editor", toggle);
	});
	return (
		<Sidepanel isVisible={isVisible}>
			<div class="px-5 py-3">
				<div class="bg-secondary-05/50 border-secondary-10 flex h-fit w-full gap-2 rounded-lg border p-4">
					<PencilRulerIcon class="h-20 w-20 shrink-0" />
					<div class="flex-1 space-y-1">
						<h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
							Editor
						</h1>
						<DropDown
							items={window.toolManager
								.getHand()
								.flatMap((i) =>
									i.cards.map((j) => `${i.title}: ${j.name}`),
								)}
							value={() =>
								kit()
									? `${window.toolManager.getHand().find((i) => i.name === kit().tool).title}: ${kit().card}`
									: ""
							}
							readonly
							onSelect={selectCard}
							placeholder="--card--"
							style={{ "--w": "100%" }}
						/>
					</div>
				</div>
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
												xyz: { ...prev.xyz, x: n },
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
												xyz: { ...prev.xyz, x: n },
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
