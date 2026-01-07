import {
	Component,
	createSignal,
	For,
	Show,
	Switch,
	Match,
	createEffect,
	on,
	createRoot,
	onCleanup,
} from "solid-js";
import { render } from "solid-js/web";
import MarkdownEditor from "@components/MarkdownEditor";
import WordInput from "@components/dynamic/WordInput.tsx";
import Tag from "@components/Tag";
import { NotebookTabsIcon } from "lucide-solid";
import NoteList from "./NoteList.tsx";
import MyIcon, { MyIconFun } from "@components/MyIcon.tsx";
import { hollow } from "hollow";
import { useNotebook, NotebookProps } from "./hooks";

const Notebook: Component<NotebookProps> = (props) => {
	const { state, actions } = useNotebook(props);

	createEffect(
		on(
			state.isExpand,
			(v) => {
				if (v) {
					const id = crypto.randomUUID();
					const control = hollow.events.getData("add-layout")({
						id,
						icon: MyIconFun({ name: "folder-open" }),
						type: "left",
						mount: (el: HTMLDivElement) => {
							const unmount = createRoot((dispose) => {
								render(
									() => (
										<NoteList
											card={props.card}
											book={state.book}
											changeSelected={
												actions.changeSelected
											}
											isExpand={state.isExpand}
										/>
									),
									el,
								);
								return dispose;
							});
							return { unmount };
						},
					});
					onCleanup(() => {
						control.close();
					});
				}
			},
			{ defer: true },
		),
	);

	return (
		<div
			class="text-md @container relative box-border flex h-full w-full flex-col items-center"
			classList={{
				"text-[1.2em]": state.isExpand(),
			}}
		>
			{/* Header */}
			<div class="border-secondary-15 hidden w-full shrink-0 items-center justify-between gap-4 border-b-0 px-3 pt-3 @xs:flex @7xl:px-4">
				<h1 class="pl-1 text-sm font-medium @7xl:pl-0 @7xl:text-lg">
					{state.book.name}{" "}
					<span class="text-secondary-40">Book</span>
				</h1>
				<div
					class="flex items-center gap-2"
					style={{ "--size": "calc(var(--spacing) * 7)" }}
				>
					<Show when={state.note() || state.editMode()}>
						<button
							class="button-control"
							onclick={() => {
								state.editMode()
									? actions.onSave()
									: state.setEditMode(true);
							}}
							style={{
								"--p": 1,
								"--border-radius": "var(--radius-sm)",
							}}
						>
							<Show
								when={state.editMode()}
								fallback={
									<MyIcon
										name="files/file-pen"
										class="size-4"
									/>
								}
							>
								<MyIcon
									name="files/file-check"
									class="size-4"
								/>
							</Show>
						</button>
					</Show>
					<button
						class="button-control"
						onclick={() => {
							state.note()?.newNote
								? (() => {
										state.setEditMode(false);
										state.setNote(
											state.book.last
												? state.book.notes.find(
														(i) =>
															i.title ===
															state.book.last,
													) || null
												: null,
										);
									})()
								: actions.onNewNote();
						}}
						style={{
							"--p": 1,
							"--border-radius": "var(--radius-sm)",
						}}
					>
						<Show
							when={!state.note()?.newNote}
							fallback={
								<MyIcon name="files/file-x" class="size-4" />
							}
						>
							<MyIcon name="files/file-plus" class="size-4" />
						</Show>
					</button>
					<Show when={!state.isExpand()}>
						<button
							class="button-control"
							onclick={actions.onFolder}
							style={{
								"--p": 1,
								"--border-radius": "var(--radius-sm)",
							}}
						>
							<Show
								when={state.showList()}
								fallback={
									<MyIcon
										name="folder-close"
										class="size-4"
									/>
								}
							>
								<MyIcon name="folder-open" class="size-4" />
							</Show>
						</button>
					</Show>
				</div>
			</div>
			{/* Body */}
			<div class="flex min-h-0 w-full flex-1 flex-col px-3 py-1">
				<Switch
					fallback={
						<div
							class="relative flex min-h-0 w-full flex-1 flex-col"
							oncontextmenu={actions.onContextMenu}
						>
							<div
								class="relative bottom-0 mx-auto mt-3 box-border h-30 w-full overflow-hidden rounded-lg opacity-100 group-hover:opacity-100 @7xl:h-35 @7xl:w-[50%]"
								classList={{
									"border-secondary-15": !state.editMode(),
									"border-transparent": state.editMode(),
								}}
							>
								<div
									class="border-secondary-10 flex h-full w-full flex-col gap-2 rounded-xl border-2"
									style={{
										...(!state.editMode() && {
											"background-image": `linear-gradient(to right, var(--color-secondary-05), transparent), url(${state.note()?.attributes?.banner})`,
											"background-size": "cover",
											"background-position": "center",
											"background-repeat": "no-repeat",
										}),
										"line-height": "0",
									}}
									classList={{ "p-2": !state.editMode() }}
								>
									<input
										class="focus:border-secondary-10 w-full max-w-full overflow-hidden rounded border-transparent text-[1.3em] font-medium text-ellipsis whitespace-nowrap text-neutral-900 dark:text-neutral-50"
										value={state.note()?.title ?? ""}
										onchange={(e) =>
											state.setNote((prev) =>
												prev
													? {
															...prev,
															title: e
																.currentTarget
																.value,
														}
													: null,
											)
										}
										placeholder={"Note Title"}
										classList={{
											"bg-secondary-10 border-1 px-2 py-1":
												state.editMode(),
										}}
										disabled={!state.editMode()}
									/>
									<div class="flex min-h-0 w-full flex-1 text-[0.7em]">
										<Show
											when={!state.editMode()}
											fallback={
												<WordInput
													words={
														state.note()?.attributes
															?.tags
															? state
																	.note()!
																	.attributes.tags.split(
																		",",
																	)
															: []
													}
													setWords={(tgs) =>
														state.setNote((prev) =>
															prev
																? {
																		...prev,
																		attributes:
																			{
																				...prev.attributes,
																				tags: tgs.join(
																					", ",
																				),
																			},
																	}
																: null,
														)
													}
												/>
											}
										>
											<div
												class="flex flex-wrap gap-1"
												style={{
													"font-size": "1.1em",
												}}
											>
												<For
													each={
														state
															.note()
															?.attributes?.tags?.split(
																",",
															)
															.map((i) =>
																i.trim(),
															) ?? []
													}
												>
													{(tag) => {
														return (
															<Tag tag={tag} />
														);
													}}
												</For>
											</div>
										</Show>
									</div>
								</div>
							</div>
							<div class="w-full flex-1 shrink-0 justify-center overflow-hidden overflow-y-scroll scroll-smooth">
								<div class="mx-auto flex w-full px-5 @4xl:w-[70%] @7xl:w-[50%]">
									<MarkdownEditor
										editMode={state.editMode}
										value={() => state.note()?.body ?? ""}
										setValue={(v) => {
											state.setNote((prev) =>
												prev
													? {
															...prev,
															body: v,
														}
													: null,
											);
										}}
										uniqueNote={() =>
											`${state.book.name.toLowerCase()}-${state.note()?.title.toLowerCase() ?? ""}`
										}
									/>
								</div>
							</div>
						</div>
					}
				>
					<Match when={state.panel() === 0}>
						<div class="flex h-full w-full items-center justify-center">
							<NotebookTabsIcon class="text-secondary-10 h-50 w-50" />
						</div>
					</Match>
					{/* Notes List */}
					<Match when={state.panel() === 1 && !state.isExpand()}>
						<div class="h-full w-full">
							<NoteList
								card={props.card}
								book={state.book}
								changeSelected={actions.changeSelected}
								isExpand={state.isExpand}
							/>
						</div>
					</Match>
				</Switch>
			</div>
		</div>
	);
};

export default Notebook;
