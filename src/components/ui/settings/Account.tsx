import Dropdown from "@components/Dropdown";
import { CharacterManager } from "@managers/CharacterManager";
import { Character } from "@type/Character";
import { FormType } from "@type/hollow";
import { hollow } from "hollow";
import { SquarePenIcon, Trash2Icon } from "lucide-solid";
import { For, Show } from "solid-js";
import { createSignal } from "solid-js";

export default function Account() {
	const [character, setCharacter] = createSignal<Character>(
		CharacterManager.getSelf().getCharacter(),
	);

	const addMeta = () => {
		const save = (data: any) => {
			setCharacter((prev) => ({
				...prev,
				meta: [...prev.meta, data],
			}));
		};
		submitForm(save);
	};

	const removeMeta = (id: string) => {
		setCharacter((prev) => ({
			...prev,
			meta: prev.meta.filter((item) => item.id !== id),
		}));
	};
	const updateMeta = (id: string) => {
		const save = (data: any) => {
			setCharacter((prev) => ({
				...prev,
				meta: prev.meta.map((i) => (i.id === data.id ? data : i)),
			}));
		};
		submitForm(save, id);
	};
	const submitForm = (save: (data: any) => void, id?: string) => {
		const target = id
			? character().meta.find((item) => item.id === id)
			: null;
		const form: FormType = {
			id: id ?? crypto.randomUUID(),
			title: id ? "Update Meta" : "Add Meta",
			submit: save,
			update: !!id,
			options: [
				{
					key: "label",
					label: "Label",
					optional: true,
					type: "text",
					inline: true,
					attributes: { placeholder: "Enter label" },
					value: target?.label ?? "",
				},
				{
					key: "icon",
					label: "Icon",
					optional: true,
					type: "text",
					inline: true,
					description:
						"Enter the icon you want to use for this meta data, names are available at lucide.dev",
					attributes: { placeholder: "Enter icon name" },
					value: target?.icon ?? "",
				},
				{
					key: "type",
					label: "Type",
					type: "dropdown",
					options: [
						{
							items: ["text", "list", "progress"],
						},
					],
					value: Array.isArray(target?.value)
						? "list"
						: typeof target?.value === "string"
							? "text"
							: "progress",
				},
				{
					key: "value",
					label: "Value",
					type: "text",
					attributes: {
						placeholder: "Enter value",
					},
					dependsOn: {
						key: "type",
						conditions: ["text"],
					},
					value: !Array.isArray(target?.value) ? target?.value : "",
				},
				{
					key: "value",
					label: "Value",
					type: "keywords",
					placeholder: "Enter values",
					dependsOn: {
						key: "type",
						conditions: ["list"],
					},
					value: !Array.isArray(target?.value)
						? target?.value
						: (target.value ?? []),
				},
				{
					key: "value",
					label: "Value",
					description:
						"This will be displayed as a progress bar ranging from 0 to 100",
					type: "range",
					min: 0,
					max: 100,
					row: true,
					dependsOn: {
						key: "type",
						conditions: ["progress"],
					},
					value:
						!Array.isArray(target?.value) && target?.value != null
							? target.value
							: 0,
				},
				{
					key: "color",
					label: "Color",
					type: "color",
					dependsOn: {
						key: "type",
						conditions: ["progress"],
					},
					row: true,
					value: target?.color ?? "#3BA936",
				},
			],
		};

		hollow.events.emit("form", form);
	};

	const onSave = (e: Event & { currentTarget: HTMLButtonElement }) => {
		const button = e.currentTarget;
		button.classList.add("debounce");
		CharacterManager.getSelf().setCharacter(character());
		hollow.events.emit("alert", {
			type: "success",
			title: "Character",
			message: "saved successfully",
			onTimeOut: () => {
				button.classList.remove("debounce");
			},
		});
	};

	return (
		<div class="h-fit w-full p-10">
			<h1 class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				Account
			</h1>
			<div class="flex w-full flex-col gap-5 p-5 pb-9">
				<div class="flex justify-between">
					<div>
						<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
							Username
						</h2>
						<p class="text-sm text-neutral-600 dark:text-neutral-400">
							Your public name across your realm
						</p>
					</div>
					<div class="w-[50%]">
						<input
							class="input"
							placeholder="username"
							value={character().username}
							onInput={(e) =>
								setCharacter((prev) => ({
									...prev,
									username: e.currentTarget.value,
								}))
							}
						/>
					</div>
				</div>
				<hr class="bg-secondary-10 h-px w-full border-0" />
				<div class="flex justify-between">
					<div>
						<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
							Description
						</h2>
						<p class="text-sm text-neutral-600 dark:text-neutral-400">
							A short description about you
						</p>
					</div>
					<div class="w-[50%]">
						<textarea
							class="input resize-none"
							placeholder="name your self"
							value={character().bio}
							onInput={(e) =>
								setCharacter((prev) => ({
									...prev,
									bio: e.currentTarget.value,
								}))
							}
						/>
					</div>
				</div>
				<hr class="bg-secondary-10 h-px w-full border-0" />
				<div class="flex justify-between">
					<div>
						<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
							Titles
						</h2>
						<p class="text-sm text-neutral-600 dark:text-neutral-400">
							A badge or role shown under your name
						</p>
					</div>
					<div>
						<Dropdown
							options={() => [
								{
									items: character().titles,
								},
							]}
							onSelect={(t) =>
								setCharacter((prev) => ({
									...prev,
									title: t,
								}))
							}
							value={() => character().title}
						/>
					</div>
				</div>
				<hr class="bg-secondary-10 h-px w-full border-0" />
				<div class="flex w-full flex-col gap-4">
					<div class="flex h-fit justify-between">
						<div>
							<h1 class="text-lg font-bold">Meta</h1>
							<h3 class="text-secondary-40">
								Add some meta data
							</h3>
						</div>
						<button
							class="button-secondary h-fit"
							onClick={addMeta}
						>
							Add
						</button>
					</div>
					<div class="bg-secondary-10/60 grid w-full grid-cols-4 gap-5 rounded-lg p-4">
						<For each={character().meta}>
							{(item) => (
								<div class="bg-secondary-05 border-secondary-20 group rounded border-1 p-2.5">
									<div class="flex items-start justify-between gap-2">
										<div class="flex min-w-0 flex-1 flex-col gap-1.5">
											<h3 class="truncate text-base font-semibold">
												{item.label}
											</h3>
											<div class="text-secondary-40 flex flex-col gap-1 text-sm">
												<div class="flex gap-1.5">
													<span class="font-medium">
														icon:
													</span>
													<span
														class="truncate"
														title={item.icon}
													>
														{item.icon}
													</span>
												</div>
												<div class="flex gap-1.5">
													<span class="font-medium">
														value:
													</span>
													{Array.isArray(
														item.value,
													) ? (
														<span
															class="truncate"
															title={item.value.join(
																", ",
															)}
														>
															{item.value.join(
																", ",
															)}
														</span>
													) : (
														<span
															class="truncate"
															title={item.value}
														>
															{item.value}
														</span>
													)}
												</div>
											</div>
										</div>
										<div class="flex flex-shrink-0 flex-col gap-1">
											<button
												class="button-control"
												onclick={() =>
													updateMeta(item.id)
												}
												title="Edit"
											>
												<SquarePenIcon class="size-3.5" />
											</button>
											<button
												class="button-control red opacity-0 transition-opacity duration-300 group-hover:opacity-100"
												onclick={() =>
													removeMeta(item.id)
												}
												title="Delete"
											>
												<Trash2Icon class="size-3.5" />
											</button>
										</div>
									</div>
								</div>
							)}
						</For>
					</div>
				</div>
				<div class="bg-secondary-05 absolute bottom-10 left-10 mt-auto flex w-[calc(100%-calc(var(--spacing)*20))] justify-end gap-2 rounded-xl p-5">
					<button
						class="button-secondary"
						onclick={() =>
							setCharacter(
								CharacterManager.getSelf().getCharacter(),
							)
						}
					>
						Cancel Changes
					</button>
					<button class="button-primary" onclick={onSave}>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
