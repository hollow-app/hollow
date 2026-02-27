import { createSignal, For, Show } from "solid-js";
import { ChevronDownIcon, EllipsisIcon, UserXIcon, XIcon } from "lucide-solid";
import { RelationshipUser } from "@app/type/Relationships";
import {
	Avatar,
	Button,
	Dropdown,
	DropdownContent,
	DropdownTrigger,
	RarityBadge,
	Tooltip,
} from "@ui";
import {
	timeDifference,
	timeDifferenceMin,
} from "@app/utils/manipulation/strings";

interface FriendProfileProps {
	user: RelationshipUser;
	hide: () => void;
}

export default function FriendProfile(props: FriendProfileProps) {
	return (
		<Show when={props.user}>
			{(user) => (
				<div class="flex h-full w-full flex-col gap-5 overflow-hidden bg-white p-6 dark:bg-neutral-950">
					<div class="flex flex-col items-center gap-4">
						{/* Banner */}
						<div class="relative mb-10 flex h-40 w-full">
							<img
								class="size-full overflow-hidden rounded-lg object-cover"
								src={user().character.identity.banner}
							/>
							<div class="absolute right-5 -bottom-10 left-0 flex items-end justify-between gap-2">
								<div class="flex w-full items-center gap-2">
									<Button
										variant="primary"
										class="flex-1"
										size="xs"
									>
										Gift Title
									</Button>
									<Tooltip
										content="Remove Friend"
										side="bottom"
									>
										<Button variant="secondary" icon>
											<UserXIcon class="text-secondary-80 size-4" />
										</Button>
									</Tooltip>
									<Dropdown>
										<DropdownTrigger>
											<Button variant="secondary" icon>
												<EllipsisIcon class="text-secondary-80 size-4" />
											</Button>
										</DropdownTrigger>
										<DropdownContent placement="left-start">
											<div class="min-w-40 p-1">
												<button class="hover:bg-secondary-20/50 w-full rounded px-3 py-2 text-start active:scale-95">
													Report User
												</button>
												<button class="hover:bg-secondary-20/50 w-full rounded px-3 py-2 text-start text-red-300 active:scale-95">
													Block
												</button>
											</div>
										</DropdownContent>
									</Dropdown>
								</div>
								<Avatar user={user().character} />
							</div>
						</div>

						{/* Name / Username / Friendship Date */}
						<div class="w-full">
							<h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
								{user().character.identity.name}
							</h2>
							<div class="space-y-4">
								<p class="text-xs font-medium text-neutral-500">
									@{user().username}
								</p>
								<Show when={user().character.title}>
									<RarityBadge
										displayLabel
										title={user().character.title}
									/>
								</Show>
							</div>
						</div>
					</div>

					{/* Bio Section */}
					<div class="flex flex-col gap-4 overflow-hidden">
						<div>
							<h3 class="mb-2 text-sm font-semibold tracking-wider text-neutral-400 dark:text-neutral-600">
								About
							</h3>
							<p class="leading-relaxed text-neutral-700 dark:text-neutral-300">
								{user().character.identity.bio ||
									"No bio available."}
							</p>
						</div>

						<Show
							when={
								user().character.achievements &&
								user().character.achievements.length > 0
							}
						>
							{(() => {
								const [isOpen, setOpen] = createSignal(false);
								return (
									<div class="bg-secondary-10 flex w-full flex-col gap-2 overflow-hidden rounded-xl p-4">
										<div
											class="flex w-full cursor-pointer items-center justify-between"
											onclick={() => setOpen((p) => !p)}
										>
											<h3 class="text-sm font-semibold">
												Achievements
												<span class="ml-2 text-xs text-neutral-500">
													{
														user().character
															.achievements.length
													}
												</span>
											</h3>
											<ChevronDownIcon
												class="size-4"
												classList={{
													"-rotate-90": !isOpen(),
												}}
											/>
										</div>
										<Show when={isOpen()}>
											<div class="flex flex-1 flex-wrap justify-center gap-2 overflow-y-auto">
												<For
													each={
														user().character
															.achievements
													}
												>
													{(achievement) => (
														<span class="shrink-0 rounded-lg border border-black/5 bg-neutral-50 px-2 py-1.5 text-xs font-medium dark:border-white/5 dark:bg-neutral-900">
															{achievement.label}
														</span>
													)}
												</For>
											</div>
										</Show>
									</div>
								);
							})()}
						</Show>
					</div>
					<div class="">
						<div class="bg-secondary-10 w-full rounded-xl p-4">
							<h3 class="text-sm font-semibold">Friends Since</h3>
							<div class="text-xs text-neutral-500">
								{timeDifference(props.user.createdAt)}
							</div>
						</div>
					</div>
				</div>
			)}
		</Show>
	);
}
