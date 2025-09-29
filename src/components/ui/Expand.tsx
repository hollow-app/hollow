import Sidepanel from "@components/animations/Sidepanel";
import Card from "@components/Card";
import Tool from "@components/Tool";
import { CardInfo } from "@type/CardInfo";
import { PlusIcon, TreesIcon } from "lucide-solid";
import { Accessor, createSignal, For, Setter, Show } from "solid-js";
// import HollowIcon from "@assets/icon-nobg.svg";
// import { lazy } from "solid-js";

// const Icon = lazy(() => import("@components/Icon"));

type ExpandProps = {
	isVisible: Accessor<boolean>;
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
		<Sidepanel isVisible={isVisible}>
			<div class="h-full w-104 overflow-hidden">
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
									: hand().flatMap((i) => i.cards).length > 0
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
								{(card: CardInfo & { toolName: string }) => (
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
	);
}
