import { useStore } from "@shared/store";
import { FormType } from "@app/type/hollow";
import { hollow } from "../../../../../hollow";
import {
	SquarePenIcon,
	ImageUpIcon,
	CheckIcon,
	GiftIcon,
	Trash2Icon,
} from "lucide-solid";
import { RarityBadge, SettingsItem } from "@ui";
import { toggleVault } from "@app/context/actions";
import { Show } from "solid-js";
import { For } from "solid-js";

export default function Profile() {
	const { state, dispatch } = useStore();

	const editIdentity = (key: "name" | "bio", label: string) => {
		const form: FormType = {
			id: `edit-${key}`,
			title: `Edit ${label}`,
			submit: (data) => {
				dispatch({
					domain: "account",
					type: "update-identity",
					key,
					value: data[key],
				});
			},
			update: true,
			options: [
				{
					key,
					label,
					type: key === "bio" ? "longtext" : "text",
					value: state.account.character.identity[key],
					attributes: {
						maxLength: key === "bio" ? 200 : 35,
						minLength: key === "bio" ? 0 : 1,
					},
				},
			],
		};
		hollow.events.emit("form", form);
	};

	const importImage = async (key: "banner" | "avatar") => {
		toggleVault((image: string) => {
			dispatch({
				domain: "account",
				type: "update-identity",
				key,
				value: image,
			});
		});
	};

	return (
		<div class="bg-secondary-05/0 overflow-hidden">
			{/* Banner Section */}
			<div class="group bg-secondary-05 relative h-32 w-full overflow-hidden rounded-xl">
				<Show when={state.account.character.identity.banner}>
					<img
						src={state.account.character.identity.banner}
						alt="Character banner"
						class="h-full w-full object-cover"
					/>
				</Show>
				<button
					class="bg-secondary-05/60 hover:bg-secondary-05 absolute top-2 right-2 flex items-center gap-1 rounded px-2 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
					onclick={() => importImage("banner")}
				>
					<ImageUpIcon class="size-4" /> Import Banner
				</button>
			</div>

			<div class="relative px-6 pb-6">
				{/* Avatar Overlay */}
				<div class="-mt-12 flex justify-start">
					<div class="group relative">
						<div class="border-secondary-10 bg-secondary-05 relative h-24 w-24 overflow-hidden rounded-2xl border-4 object-cover shadow-xl">
							<Show
								when={state.account.character.identity.avatar}
								fallback={
									<div class="flex h-full w-full items-center justify-center bg-neutral-300 dark:bg-neutral-700">
										<ImageUpIcon class="size-8 text-neutral-500" />
									</div>
								}
							>
								<img
									src={
										state.account.character.identity.avatar
									}
									alt={state.account.character.identity.name}
									class="h-full w-full object-cover"
								/>
							</Show>

							<button
								class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
								onclick={() => importImage("avatar")}
							>
								<ImageUpIcon class="size-6 text-white" />
							</button>
						</div>
						{/* Level Badge if applicable */}
						<Show when={state.account.character.level?.total}>
							<div class="bg-secondary-foreground border-secondary-10 text-secondary absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-lg border-2 text-xs font-bold shadow-md">
								{state.account.character.level.total}
							</div>
						</Show>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-4 px-6 pb-6">
				<SettingsItem
					title="Display Name"
					description={state.account.character.identity.name}
				>
					<button
						class="button-control"
						onclick={() => editIdentity("name", "Name")}
					>
						<SquarePenIcon size={14} />
					</button>
				</SettingsItem>

				<SettingsItem
					title="About Me"
					description={state.account.character.identity.bio || "None"}
				>
					<button
						class="button-control"
						onclick={() => editIdentity("bio", "Bio")}
					>
						<SquarePenIcon size={14} />
					</button>
				</SettingsItem>

				<SettingsItem
					title="Current Title"
					description="Short label or honorific attached to your profile."
				>
					<RarityBadge
						title={state.account.character.title}
						displayLabel
					/>
				</SettingsItem>
				<div class="bg-secondary-05/60 overflow-hidden rounded-lg">
					<table class="w-full text-left text-sm">
						<thead class="bg-secondary-10/50 text-secondary-foreground/60">
							<tr>
								<th class="px-4 py-2 font-medium">Title</th>
								<th class="px-4 py-2 font-medium">Rarity</th>
								<th class="px-4 py-2 text-right font-medium">
									Actions
								</th>
							</tr>
						</thead>
						<tbody class="divide-secondary-10 text-secondary-foreground divide-y">
							<For each={state.account.character.titles}>
								{(title) => (
									<tr class="hover:bg-secondary-10/30 transition-colors">
										<td class="px-4 py-3">
											<span
												class="font-medium"
												classList={{
													"text-primary":
														title.id ===
														state.account.character
															.title.id,
												}}
											>
												{title.label}
											</span>
										</td>
										<td class="px-4 py-3">
											<RarityBadge title={title} />
										</td>
										<td class="px-4 py-3 text-right">
											<div class="text-secondary-40 flex justify-end gap-2">
												<button
													class="hover:bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
													classList={{
														"text-primary":
															state.account
																.character.title
																.id ===
															title.id,
													}}
													title="Select Title"
													onclick={() =>
														dispatch({
															domain: "account",
															type: "update-title",
															id: title.id,
														})
													}
												>
													<CheckIcon size={16} />
												</button>
												<button
													class="hover:bg-secondary-10 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
													title="Gift Title"
												>
													<GiftIcon size={16} />
												</button>
												<button
													class="hover:bg-destructive/20 text-destructive flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
													title="Delete Title"
												>
													<Trash2Icon size={16} />
												</button>
											</div>
										</td>
									</tr>
								)}
							</For>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
