import Sidepanel from "@components/animations/Sidepanel";
import Card from "@components/Card";
import Tool from "@components/Tool";
import { CardInfo } from "@type/CardInfo";
import { HandType } from "@type/HandType";
import { PlusIcon, TreesIcon } from "lucide-solid";
import {
	Accessor,
	createEffect,
	createSignal,
	For,
	Setter,
	Show,
} from "solid-js";
import HollowIcon from "@assets/icon-nobg.svg";
import { lazy } from "solid-js";
const Icon = lazy(() => import("@components/Icon"));

type ExpandProps = {
	isVisible: Accessor<boolean>;
	setVisible: Setter<boolean>;
};

export default function Expand({ isVisible }: ExpandProps) {
	const [selected, setSelected] = createSignal<number>(0);
	const [hand, setHand] = createSignal(window.toolManager.hand);

	const onSubmitNewCard = (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const input = form.elements.namedItem("card-name") as HTMLInputElement;
		if (input.value != "") {
			window.toolManager.addCard(input.value, hand()[selected()].name);
		}
		setHand([...window.toolManager.hand]);
		input.value = "";
	};

	return (
		<div class="flex">
			<SideBar {...{ isVisible, hand, setHand, selected, setSelected }} />
			<Sidepanel isVisible={isVisible}>
				<div class="h-full w-104 overflow-visible">
					<div class="box-border flex h-full min-h-0 flex-1 flex-col pt-4 pr-2 pl-1">
						<Show
							when={selected() !== -1}
							fallback={
								<>
									<div class="flex items-center justify-between gap-40">
										<h2 class="font-light">All</h2>
									</div>
									<hr class="border-secondary-10 border-px mt-3 w-full" />
								</>
							}
						>
							<>
								<Tool
									tool={() =>
										(({ cards, ...tool }) => tool)(
											hand()[
												hand().length > selected()
													? selected()
													: 0
											],
										)
									}
								/>

								<hr class="border-secondary-10 border-px mb-3 w-full" />
								<form
									class="flex h-fit w-full justify-end gap-2"
									onsubmit={onSubmitNewCard}
								>
									<input
										type="text"
										pattern="^[A-Za-z]+$"
										placeholder="Card name (e.g., ToDo)"
										class="input"
										title="Only letters are allowed."
										name="card-name"
									/>
									<button
										type="submit"
										class="button-control my-auto"
									>
										<PlusIcon />
									</button>
								</form>
							</>
						</Show>

						<div class="flex flex-1 flex-col gap-5 overflow-hidden overflow-y-auto py-4">
							<Show
								when={
									selected() !== -1
										? hand()[selected()].cards.length > 0
										: hand().flatMap((i) => i.cards)
												.length > 0
								}
								fallback={
									<div class="border-secondary-20 text-secondary-25 m-auto h-fit w-fit flex-col gap-2 rounded border-0 border-dashed p-5">
										<TreesIcon class="mx-auto size-7 animate-pulse" />
										<h1 class="w-fit font-normal select-none">
											Make some cards
										</h1>
									</div>
								}
							>
								<For
									each={
										selected() !== -1
											? hand()[
													hand().length > selected()
														? selected()
														: 0
												].cards
											: hand().flatMap((i) =>
													i.cards.map((j) => ({
														...j,
														toolName: i.name,
													})),
												)
									}
								>
									{(
										card: CardInfo & { toolName: string },
									) => (
										<Card
											toolName={
												selected() !== -1
													? hand()[selected()].name
													: card.toolName
											}
											myCard={card}
											setHand={setHand}
										/>
									)}
								</For>
							</Show>
						</div>
					</div>
				</div>
			</Sidepanel>
		</div>
	);
}

type SideBarProps = {
	isVisible: Accessor<boolean>;
	hand: Accessor<HandType[]>;
	setHand: Setter<HandType[]>;
	selected: Accessor<number>;
	setSelected: Setter<number>;
};
function SideBar({
	isVisible,
	setHand,
	hand,
	selected,
	setSelected,
}: SideBarProps) {
	let toolContainer!: HTMLDivElement;
	createEffect(() => {
		if (isVisible()) {
			toolContainer.scrollTop =
				toolContainer.scrollHeight / 2 - toolContainer.clientHeight / 2;
			setHand([...window.toolManager.hand]);
		}
	});
	return (
		<div class="relative flex flex-col gap-2 border-0 border-secondary-10 rounded-xl h-full min-h-0 w-14 items-center py-2 shadow-xl/40 shadow-black">
			<div class="size-10 flex items-center justify-center py-5">
				<HollowIcon
					class="selector-logo size-8 hollow-effect"
					style={{
						"--color": "var(--color-secondary-90)",
					}}
				/>
			</div>
			<hr class="border-t-0 border-b h-[2px] border-secondary bg-secondary-10 w-10" />
			<div
				ref={toolContainer}
				class="hide-scroll relative my-auto flex h-full max-h-full min-h-0 w-fit snap-y snap-mandatory flex-col gap-4 overflow-x-hidden overflow-y-scroll scroll-smooth"
			>
				<For each={hand()}>
					{({ icon, title }, index) => (
						<Icon
							name={icon}
							class="size-10 border-secondary-10 shrink-0 cursor-pointer snap-start rounded-xl p-2 text-neutral-500 transition-all"
							classList={{
								"text-secondary-95 border-b-2 border bg-linear-to-bl from-secondary-10 to-secondary-15 ":
									selected() === index(),
								"hover:text-neutral-100 dark:hover:text-neutral-900":
									selected() !== index(),
							}}
							onclick={() => setSelected(index())}
						/>
					)}
				</For>
			</div>
		</div>
	);
}
