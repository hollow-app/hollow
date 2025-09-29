import Sidepanel from "@components/animations/Sidepanel";
import Icon from "@components/Icon";
import { CharacterManager } from "@managers/CharacterManager";
import { importImage } from "@managers/manipulation/images";
import { ImageUpIcon } from "lucide-solid";
import { For, onMount } from "solid-js";
import { createSignal, Show } from "solid-js";
import { Accessor } from "solid-js";

type CharacterPanelProps = {
	isVisible: Accessor<boolean>;
};

export default function CharacterPanel({ isVisible }: CharacterPanelProps) {
	const [character, setCharacter] = createSignal(null);

	const import_image = async (key: string) => {
		const image = await importImage();
		// setCharacter((prev) => ({ ...prev, [key]: image }));
		CharacterManager.getSelf().setCharacter({ [key]: image });
	};

	onMount(() => {
		CharacterManager.getSelf().setUiCharacter = setCharacter;
		setCharacter(CharacterManager.getSelf().getCharacter());
	});
	return (
		<Sidepanel isVisible={isVisible}>
			<div class="w-102 h-full mt-2 rounded-2xl border border-secondary-20/50 bg-linear-to-tl from-secondary-05 to-secondary overflow-hidden">
				<div class="group relative w-full h-32 ">
					<Show when={character()?.banner}>
						<img
							src={character().banner || "/placeholder.svg"}
							alt="Character banner"
							class="w-full h-full object-cover"
						/>
					</Show>
					<button
						class="top-2 right-2 opacity-0 bg-secondary-05/60 rounded group-hover:opacity-100 transition-opacity flex absolute px-1 tracking-widest"
						onclick={() => import_image("banner")}
					>
						<ImageUpIcon class="p-1" />
					</button>
				</div>

				{/* Avatar Section */}
				<div class="relative px-6 pb-6 pointer-events-none">
					<div class="flex justify-start  pointer-events-none -mt-12">
						<div class="relative pointer-events-auto">
							<div class="relative group w-20 h-20 rounded-2xl border-3 border-secondary-20 bg-secondary-05 object-cover shadow-lg overflow-hidden">
								<Show when={character()?.avatar}>
									<img
										src={
											character().avatar ||
											"/placeholder.svg"
										}
										alt={character().username}
									/>
								</Show>

								<button
									class="absolute inset-0 opacity-0 bg-secondary-05/50 group-hover:opacity-100 transition-opacity"
									onclick={() => import_image("avatar")}
								>
									<ImageUpIcon class="p-1 mx-auto" />
								</button>
							</div>
							<Show when={character()?.level}>
								<div class="absolute -bottom-1 -right-1 bg-secondary-90 text-secondary text-xs font-bold rounded-lg w-6 h-6 flex items-center justify-center border-2 border-secondary shadow-sm">
									{character().level}
								</div>
							</Show>
						</div>
					</div>

					{/* Character Info */}
					<div class="mt-4 space-y-4 text-left pointer-events-auto">
						<div class="space-y-1">
							<h2 class="text-2xl font-bold tracking-tight">
								{character()?.username}
							</h2>
							<Show when={character()?.title}>
								<div class="bg-secondary-10 border-1 border-secondary-25 w-fit px-1 rounded tracking-widest text-xs">
									{character().title}
								</div>
							</Show>
						</div>
						<div class="text-sm text-gray-400">
							<span class="text-secondary-50">Realm:</span>{" "}
							<span class="text-secondary-95 pl-2">
								{
									window.realmManager.getRealmFromId(
										window.realmManager.currentRealmId,
									).name
								}
							</span>
						</div>
						{/* XP Progress */}
						<Show when={character()?.xp !== undefined}>
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span class="text-sm font-semibold dark:text-neutral-400  text-neutral-600">
										Experience
									</span>
									<span class="text-neutral-300 font-medium">
										{character().xp} XP
									</span>
								</div>
								<div class="h-1.5 bg-secondary-10 rounded-full overflow-hidden">
									<hr
										class="border-0 bg-linear-to-r from-primary-30 to-primary h-full"
										style={{
											width: `${character().xp / character().level}%`,
										}}
									/>
								</div>
							</div>
						</Show>
						{/* Bio */}
						<p class="text-sm text-gray-300 leading-relaxed">
							{character()?.bio}
						</p>
						{/* Mrta */}
						<Show when={character()?.meta.length > 0}>
							<div class="space-y-3">
								<h3 class="text-sm font-semibold dark:text-neutral-400  text-neutral-600">
									Meta
								</h3>

								<Show
									when={character().meta.some(
										(i) => typeof i.value === "number",
									)}
								>
									<For
										each={character().meta.filter(
											(i) => typeof i.value === "number",
										)}
									>
										{(m) => (
											<div class="flex items-center gap-2">
												<div class="flex items-center gap-1 bg-secondary-10 rounded  p-1">
													<Icon
														name={m.icon}
														class="size-4"
														style={{
															color: m.color,
														}}
													/>
													<Show when={m.label}>
														<h3 class="text-sm font-medium uppercase text-secondary-40">
															{m.label}
														</h3>
													</Show>
												</div>
												<div
													class="h-1.5 flex-1 bg-secondary-10 rounded-full overflow-hidden"
													title={`${m.value}%`}
												>
													<hr
														class="border-0 h-full"
														style={{
															width: `${m.value}%`,
															background: `linear-gradient(to right, color-mix(in oklab, transparent, ${m.color}), ${m.color})`,
														}}
													/>
												</div>
											</div>
										)}
									</For>
								</Show>
								<div class="flex flex-wrap gap-2">
									<Show
										when={character().meta.some(
											(i) => typeof i.value === "string",
										)}
									>
										<For
											each={character().meta.filter(
												(i) =>
													typeof i.value === "string",
											)}
										>
											{(m) => (
												<div class="flex items-center gap-1 bg-secondary-10 w-fit px-2 py-1 rounded">
													<Show when={m.icon}>
														<Icon
															name={m.icon}
															class="size-4"
														/>
													</Show>
													<Show when={m.label}>
														<span class="text-sm font-medium uppercase text-secondary-40">
															{m.label}
														</span>
													</Show>
													<span class="text-xs">
														{m.value}
													</span>
												</div>
											)}
										</For>
									</Show>
								</div>
							</div>
						</Show>
						{/* Achievements */}
						<Show
							when={
								character()?.achievements &&
								character()?.achievements.length > 0
							}
						>
							<div class="space-y-3">
								<h3 class="text-sm font-semibold dark:text-neutral-400  text-neutral-600">
									Achievements
								</h3>
								<div class="flex flex-wrap gap-2">
									<For
										each={character().achievements.slice(
											0,
											10,
										)}
									>
										{(achievement) => (
											<div class="text-xs px-2 py-1 bg-secondary-10 rounded-md">
												{achievement}
											</div>
										)}
									</For>
									<Show
										when={
											character().achievements.length > 10
										}
									>
										<div class="text-xs px-2 py-1 bg-secondary-10 rounded-md">
											+
											{character().achievements.length -
												10}
										</div>
									</Show>
								</div>
							</div>
						</Show>
					</div>
				</div>
			</div>
		</Sidepanel>
	);
}
