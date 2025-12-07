import { NotebookProps } from ".";
import FileCheckIcon from "@assets/icons/files/file-check.svg";
import FilePenIcon from "@assets/icons/files/file-pen.svg";
import FilePlusIcon from "@assets/icons/files/file-plus.svg";
import FolderOpenIcon from "@assets/icons/folder-open.svg";
import FolderCloseIcon from "@assets/icons/folder-close.svg";
import type { StateType } from "./state";
import type { LogicType } from "./logic.tsx";
import type { HelperType } from "./helper";
import {
	Accessor,
	createEffect,
	createResource,
	For,
	on,
	onCleanup,
	Setter,
	Show,
	Suspense,
	Switch,
} from "solid-js";
import MarkdownEditor from "@components/MarkdownEditor";
import { Motion, Presence } from "solid-motionone";
import WordInput from "@components/WordInput";
import Tag from "@components/Tag";
import { NotebookTabsIcon } from "lucide-solid";
import NoteList from "./NoteList.tsx";
import { Match } from "solid-js";
import { Portal } from "solid-js/web";
import { hollow } from "hollow";
import { ICard } from "@type/hollow.js";
import { NotebookType } from "../NotebookType";

export const NotebookView = (
	state: StateType,
	logic: LogicType,
	props: NotebookProps,
	helper?: HelperType,
) => {
	return (
		<div
			class="text-md @container relative box-border flex h-full w-full flex-col items-center p-3"
			classList={{ "text-[1.2em]": state.isExpand() }}
		>
			{/* Header */}
			<div class="bg-secondary-05 hidden h-10 w-full shrink-0 items-center justify-between gap-4 rounded px-2 @xs:flex @7xl:h-13 @7xl:px-4">
				<h1 class="text-sm font-medium @7xl:text-lg">
					{state.book.name}{" "}
					<span class="text-secondary-40">Book</span>
				</h1>
				<div class="flex items-center gap-2">
					<Show when={state.note() || state.editMode()}>
						<button
							class="button-control"
							onclick={() => {
								state.editMode()
									? logic.onSave()
									: state.setEditMode(true);
							}}
							style={{
								"--p": 1,
								"--border-radius": "var(--radius-sm)",
							}}
						>
							<Show
								when={state.editMode()}
								fallback={<FilePenIcon class="size-5" />}
							>
								<FileCheckIcon class="size-5" />
							</Show>
						</button>
					</Show>
					<button
						class="button-control"
						onclick={logic.onNewNote}
						style={{
							"--p": 1,
							"--border-radius": "var(--radius-sm)",
						}}
					>
						<FilePlusIcon class="size-5" />
					</button>
					<button
						class="button-control"
						onclick={logic.onFolder}
						style={{
							"--p": 1,
							"--border-radius": "var(--radius-sm)",
						}}
					>
						<Show
							when={state.showList()}
							fallback={<FolderCloseIcon class="size-5" />}
						>
							<FolderOpenIcon class="size-5" />
						</Show>
					</button>
				</div>
			</div>
			{/* Body */}
			<Switch
				fallback={
					<div
						class="relative flex min-h-0 w-full flex-1 flex-col"
						oncontextmenu={logic.onContextMenu}
					>
						<div
							class="border-secondary-05 relative bottom-0 mx-auto mt-3 box-border h-30 w-full overflow-hidden rounded-xl border opacity-100 transition-all group-hover:opacity-100 @7xl:h-35"
							style={{
								"background-image": `linear-gradient(to right, var(--secondary-color-05), transparent), url(${state.note().attributes?.banner})`,
								"background-size": "cover",
								"background-position": "center",
								"background-repeat": "no-repeat",
							}}
						>
							<div
								class="flex h-full w-full flex-col gap-2 p-2"
								classList={{
									"bg-secondary": state.editMode(),
								}}
								style={{
									"line-height": "0",
								}}
							>
								<input
									class="focus:border-secondary-10 w-full max-w-full overflow-hidden rounded border-transparent text-[1.3em] font-medium text-ellipsis whitespace-nowrap text-gray-900 dark:text-gray-50"
									value={state.note().title}
									onchange={(e) =>
										state.setNote((prev) => ({
											...prev,
											title: e.currentTarget.value,
										}))
									}
									placeholder={"Note Title"}
									classList={{
										"bg-secondary-05 border-1 px-2 py-1":
											state.editMode(),
									}}
									disabled={!state.editMode()}
								/>
								<div class="flex min-h-0 w-full flex-1 text-[0.7em]">
									<Show
										when={!state.editMode()}
										fallback={
											<WordInput
												words={() =>
													state
														.note()
														.attributes?.tags.split(
															",",
														) ?? []
												}
												setWords={(tgs) =>
													state.setNote((prev) => ({
														...prev,
														attributes: {
															...prev.attributes,
															tags: tgs.join(
																", ",
															),
														},
													}))
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
														.attributes?.tags?.split(
															",",
														) ?? []
												}
											>
												{(tag) => {
													const target = () =>
														state
															.hollowTags()
															.find(
																(i) =>
																	i.name ===
																	tag,
															);
													return (
														<Tag
															tag={() => tag}
															background={() =>
																target()
																	?.background ??
																"var(--color-secondary-95)"
															}
														/>
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
									value={() => state.note().body}
									setValue={(v) => {
										state.setNote((prev) => ({
											...prev,
											body: v,
										}));
									}}
									uniqueNote={() =>
										`${state.book.name.toLowerCase()}-${state.note().title.toLowerCase()}`
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
				<Match when={state.panel() === 1}>
					<div class="h-full w-full">
						<NoteList
							card={props.card}
							book={state.book}
							changeSelected={logic.changeSelected}
						/>
					</div>
				</Match>
			</Switch>
		</div>
	);
};
