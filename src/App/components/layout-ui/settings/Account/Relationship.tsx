import { RelationshipUser } from "center";
import { Tab, TabList, TabPanel, Tabs } from "@component/ui/Tabs";
import { Button, Drawer, Input } from "@ui";
import { UserIcon, UserPlusIcon } from "lucide-solid";
import { createSignal, For } from "solid-js";
import FriendProfile from "./components/FriendProfile";
import { timeDifferenceMin } from "@app/utils/manipulation/strings";
import { Show } from "solid-js";

export default function Relationship() {
	const [requestedProfile, setRequestedProfile] =
		createSignal<RelationshipUser | null>(null);

	return (
		<>
			<Tabs
				defaultValue="friends"
				variant="box"
				class="flex size-full flex-col"
			>
				<TabList>
					<Tab value="friends">Friends</Tab>
					<Tab value="blocked">Blocked</Tab>
					<Tab value="requests" last>
						<UserPlusIcon
							class="text-secondary-50"
							classList={{
								"text-secondary-foreground": request.length > 0,
							}}
							size={16}
						/>
					</Tab>
				</TabList>
				<TabPanel
					value="friends"
					class="flex w-full flex-1 flex-col gap-2 overflow-hidden"
				>
					<div class="flex items-center gap-2">
						<Input
							icon={"user-add"}
							placeholder="You can add friends with their username."
							oninput={(e) => {
								// setRequestedFriend(
								//         e
								//                 .currentTarget
								//                 .value,
								// )
							}}
						/>
						<Button.Root variant="primary" size="xs">
							Add Friend
						</Button.Root>
					</div>

					<div class="text-xs text-neutral-500">All friends</div>
					<div class="flex flex-col gap-2 overflow-y-auto">
						<For each={friends}>
							{(user) => (
								<div class="bg-secondary-05 flex w-full items-center justify-between rounded-md p-2">
									<div class="flex items-center gap-2 font-medium">
										<div class="border-secondary-20 size-10 overflow-hidden rounded-md border">
											<Show
												when={
													user.character.identity
														.avatar
												}
												fallback={
													<UserIcon class="box-border size-full p-2 text-neutral-400" />
												}
											>
												<img
													class="size-full object-cover"
													src={
														user.character.identity
															.avatar
													}
												/>
											</Show>
										</div>
										<div class="flex flex-col">
											{user.character.identity.name}
											<span class="text-xs text-neutral-500">
												{user.username}
											</span>
										</div>
									</div>
									<div class="text-secondary-40 flex justify-end gap-2">
										<button
											class="hover:bg-secondary-10 hover:text-secondary-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
											title="View Profile"
											onclick={() =>
												setRequestedProfile(user)
											}
										>
											<UserIcon size={16} />
										</button>
									</div>
								</div>
							)}
						</For>
					</div>
				</TabPanel>
				<TabPanel
					value="blocked"
					class="flex w-full flex-1 flex-col gap-2 overflow-hidden"
				>
					<div class="text-xs text-neutral-500">
						Accounts you have Blocked.
					</div>
					<div class="flex flex-col gap-2 overflow-y-auto">
						<For each={blocked}>
							{(user) => (
								<div class="bg-secondary-05 flex w-full items-center justify-between rounded-md px-3 py-1">
									<span class="font-medium">
										{user.username}
									</span>
									<div class="text-secondary-40 flex justify-end gap-2">
										<Button.Root
											variant="secondary"
											size="xs"
										>
											Unblock
										</Button.Root>
									</div>
								</div>
							)}
						</For>
					</div>
				</TabPanel>
				<TabPanel
					value="requests"
					class="flex w-full flex-1 flex-col gap-2 overflow-hidden"
				>
					<div class="text-xs text-neutral-500">
						Accounts have sent you friend requests
					</div>
					<div class="flex flex-col gap-2 overflow-y-auto">
						<For each={request}>
							{(user) => (
								<div class="bg-secondary-05 flex w-full items-center justify-between rounded-md px-3 py-1">
									<span class="font-medium">
										{user.username}
									</span>
									<span class="text-xs text-neutral-500">
										{timeDifferenceMin(user.createdAt)}
									</span>
									<div class="text-secondary-40 flex justify-end gap-2">
										<Button.Root
											variant="secondary"
											size="xs"
										>
											Reject
										</Button.Root>
										<Button.Root
											variant="primary"
											size="xs"
										>
											Accept
										</Button.Root>
									</div>
								</div>
							)}
						</For>
					</div>
				</TabPanel>
			</Tabs>
			<Drawer
				open={!!requestedProfile()}
				onClose={() => setRequestedProfile(null)}
				direction="right"
				class="w-full md:w-[400px]"
			>
				<FriendProfile
					user={requestedProfile()!}
					hide={() => setRequestedProfile(null)}
				/>
			</Drawer>
		</>
	);
}
const now = new Date().toISOString();
function randomDate(start: Date, end: Date) {
	return new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	).toISOString();
}

const start = new Date(2020, 0, 1);
const end = new Date(2025, 0, 1);

const friends: RelationshipUser[] = [
	{
		uid: "user_001",
		username: "Lyra",
		createdAt: randomDate(start, end),
		userCreatedAt: randomDate(start, end),
		character: {
			identity: {
				name: "Lyra Moonwind",
				bio: "Swift archer of the northern woods.",
				avatar: "https://i.pinimg.com/736x/e9/69/0a/e9690a36d8476e3585adc8d0ac2dcf89.jpg",
				banner: "https://i.pinimg.com/1200x/f1/11/7c/f1117c1565551a3e8723608c241fd61f.jpg",
				lastUpdatedAt: now,
			},
			title: {
				id: "title_windrunner",
				source: "system",
				createdAt: now,
				label: "Windrunner",
				rarity: "rare",
			},
			level: {
				total: 1,
				xp: 40,
				lastUpdatedAt: now,
			},
			achievements: [
				{
					id: "ach_first_step",
					source: "system",
					createdAt: now,
					label: "First Step",
					description: "Completed the tutorial questline.",
					icon: "🌀",
				},
			],
		},
	},
	{
		uid: "user_002",
		username: "Axiom",
		createdAt: randomDate(start, end),
		userCreatedAt: randomDate(start, end),
		character: {
			identity: {
				name: "Axiom Vale",
				bio: "Scholar of forgotten runes.",
				avatar: "https://i.pinimg.com/736x/d7/bd/4a/d7bd4a60a366fb8dc055d88edabf4a96.jpg",
				banner: "https://picsum.photos/1200/300?random=1",
				lastUpdatedAt: now,
			},
			title: {
				id: "title_runesage",
				source: "system",
				createdAt: now,
				label: "Runesage",
				rarity: "epic",
			},
			level: {
				total: 5,
				xp: 320,
				lastUpdatedAt: now,
			},
			achievements: [],
		},
	},
	{
		uid: "user_003",
		username: "Ember",
		createdAt: randomDate(start, end),
		userCreatedAt: randomDate(start, end),
		character: {
			identity: {
				name: "Ember Ashfall",
				bio: "Fire-touched brawler with a short fuse.",
				avatar: "https://i.pinimg.com/1200x/85/a6/99/85a69912405712de7ecd3762c2d860ac.jpg",
				banner: "https://picsum.photos/1200/300?random=2",
				lastUpdatedAt: now,
			},
			title: {
				id: "title_flameborn",
				source: "system",
				createdAt: now,
				label: "Flameborn",
				rarity: "rare",
			},
			level: {
				total: 3,
				xp: 180,
				lastUpdatedAt: now,
			},
			achievements: [],
		},
	},
	{
		uid: "user_004",
		username: "Kairo",
		createdAt: randomDate(start, end),
		userCreatedAt: randomDate(start, end),
		character: {
			identity: {
				name: "Kairo Flux",
				bio: "Manipulator of unstable timelines.",
				avatar: "https://i.pinimg.com/736x/b5/18/41/b5184171fd55fc19e78ef17459bdd908.jpg",
				banner: "https://picsum.photos/1200/300?random=3",
				lastUpdatedAt: now,
			},
			title: {
				id: "title_chrono_adept",
				source: "system",
				createdAt: now,
				label: "Chrono Adept",
				rarity: "epic",
			},
			level: {
				total: 7,
				xp: 540,
				lastUpdatedAt: now,
			},
			achievements: [],
		},
	},
	{
		uid: "user_005",
		username: "Nyx",
		createdAt: randomDate(start, end),
		userCreatedAt: randomDate(start, end),
		character: {
			identity: {
				name: "Nyx Shadowveil",
				bio: "Silent operative of the dusk.",
				avatar: "https://picsum.photos/400?random=4",
				banner: "https://picsum.photos/1200/300?random=4",
				lastUpdatedAt: now,
			},
			title: {
				id: "title_nightblade",
				source: "system",
				createdAt: now,
				label: "Nightblade",
				rarity: "rare",
			},
			level: {
				total: 4,
				xp: 260,
				lastUpdatedAt: now,
			},
			achievements: [],
		},
	},
	{
		uid: "user_006",
		username: "Orion",
		createdAt: randomDate(start, end),
		userCreatedAt: randomDate(start, end),
		character: {
			identity: {
				name: "Orion Brightmantle",
				bio: "Radiant defender sworn to the light.",
				avatar: "https://picsum.photos/400?random=5",
				banner: "https://picsum.photos/1200/300?random=5",
				lastUpdatedAt: now,
			},
			title: {
				id: "title_lightbearer",
				source: "system",
				createdAt: now,
				label: "Lightbearer",
				rarity: "epic",
			},
			level: {
				total: 6,
				xp: 410,
				lastUpdatedAt: now,
			},
			achievements: [],
		},
	},
	{
		uid: "user_007",
		username: "Vex",
		createdAt: randomDate(start, end),
		userCreatedAt: randomDate(start, end),
		character: {
			identity: {
				name: "Vex Ironclad",
				bio: "Mercenary with an unbreakable will.",
				avatar: "https://picsum.photos/400?random=6",
				banner: "https://picsum.photos/1200/300?random=6",
				lastUpdatedAt: now,
			},
			title: {
				id: "title_warforged",
				source: "system",
				createdAt: now,
				label: "Warforged",
				rarity: "common",
			},
			level: {
				total: 2,
				xp: 90,
				lastUpdatedAt: now,
			},
			achievements: [],
		},
	},
];

const blocked: Omit<RelationshipUser, "character" | "userCreatedAt">[] = [
	{
		uid: "user_101",
		username: "GrimVoid",

		createdAt: randomDate(start, end),
	},
	{
		uid: "user_102",

		createdAt: randomDate(start, end),
		username: "Static",
	},
];

const request: Omit<RelationshipUser, "character" | "userCreatedAt">[] = [
	{
		uid: "user_101",

		createdAt: randomDate(start, end),
		username: "Friend1",
	},
	{
		uid: "user_102",

		createdAt: randomDate(start, end),
		username: "Friend2",
	},
];
