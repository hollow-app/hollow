import ColorPick from "@components/ColorPick";
import { formatDate, timeDifference } from "@managers/manipulation/strings";
import { Realm } from "@type/Realm";
import HollowIcon from "@assets/icon-nobg.svg";
import {
	CalendarIcon,
	OrbitIcon,
	Trash2Icon,
	PlusIcon,
	ArrowLeftIcon,
	RocketIcon,
	PandaIcon,
	CheckIcon,
} from "lucide-solid";
import {
	Accessor,
	createResource,
	createSignal,
	For,
	Setter,
	Show,
	Suspense,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import WindowControl from "@components/WindowControl";
import { Character } from "@type/Character";
import { CharacterManager } from "@managers/CharacterManager";
import { useColor } from "@hooks/useColor";
import Loading from "@components/Loading";
import { RealmManager } from "@managers/RealmManager";
import { hollow } from "hollow";
import Dropdown from "@components/Dropdown";

type SelectorProps = {
	onSelect: (id: string) => void;
};

const themes = [
	{ name: "Ocean", primary: "#00B4D8", secondary: "#0A192F" },
	{ name: "Sunset", primary: "#FF7043", secondary: "#2C1A1A" },
	{ name: "Golden", primary: "#FFC107", secondary: "#1A1A1A" },
	{ name: "Arctic", primary: "#00ACC1", secondary: "#0F1B2E" },
	{ name: "Midnight", primary: "#4FC3F7", secondary: "#F4F6F8" },
	{ name: "Forest", primary: "#1B5E20", secondary: "#F1F8F4" },
	{ name: "Plum", primary: "#6A1B9A", secondary: "#F8F3FC" },
	{ name: "Neon", primary: "#F50057", secondary: "#FDF0F5" },
	{ name: "Rustic", primary: "#5D4037", secondary: "#FDF5E6" },
	{ name: "Emerald", primary: "#2E7D32", secondary: "#F1FFF4" },
];
const useRealmManager = () => {
	const [name, setName] = createSignal("");
	const [primary, setPrimary] = createSignal("#FF0033");
	const [secondary, setSecondary] = createSignal("#000000");

	const createRealm = () => {
		if (!name()) return false;

		const newRealm: Realm = {
			id: crypto.randomUUID(),
			name: name(),
			lastEntered: new Date().toISOString(),
			createdDate: new Date().toISOString(),
			colors: {
				primary: primary(),
				secondary: secondary(),
			},
		};
		RealmManager.getSelf().addRealm(newRealm);
		return true;
	};

	const removeRealm = (id: string, setRealms: Setter<Realm[]>) => {
		const handleDecision = () => {
			RealmManager.getSelf().removeRealm(id);
			setRealms((prev) => prev.filter((r) => r.id !== id));
		};
		hollow.events.emit("confirm", {
			type: "warning",
			message: `Are you sure you want to remove ${RealmManager.getSelf().getRealmFromId(id)?.name} Realm?`,
			onAccept: handleDecision,
		});
	};

	return {
		name,
		setName,
		primary,
		setPrimary,
		secondary,
		setSecondary,
		createRealm,
		removeRealm,
	};
};

const WelcomeScreen = (props: { onNext: () => void }) => (
	<Motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		transition={{ duration: 0.3 }}
		class="relative flex h-full w-full items-center justify-center"
	>
		<div class="relative flex w-fit flex-col items-center">
			<div class="rotate-[10deg]">
				<h1 class="mt-8 text-6xl font-black tracking-tight text-white">
					Hello, adventurer!
				</h1>
				<h1 class="mt-2 w-150 text-lg tracking-widest text-neutral-400 uppercase">
					Hollow is ready to help you explore, imagine, and create.
					Let’s dive in!
				</h1>
			</div>
			<button
				class="button-primary mt-7 ml-auto flex items-center gap-3 text-black"
				onclick={props.onNext}
			>
				<RocketIcon class="hidden size-5" />
				<span class="relative z-10">Start</span>
			</button>
		</div>
	</Motion.div>
);

const RealmList = (props: {
	onBack: () => void;
	onSelect: (id: string) => void;
	realms: Accessor<Realm[]>;
	setRealms: Setter<Realm[]>;
}) => {
	const { removeRealm } = useRealmManager();

	return (
		<Motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			class="up-pop flex h-170 w-160 flex-col"
			style={{
				"--bg-color": "var(--color-neutral-950)",
				"--border-color": "var(--color-neutral-900)",
				"--position": "relative",
			}}
		>
			<div class="title-panel flex items-center justify-between">
				<h1 class="h1-title">Realms</h1>
				<button
					class="button-empty flex items-center gap-1 tracking-wide text-white"
					style={{
						"--bg-color":
							"color-mix(in oklab, var(--color-neutral-800) 100% , black 30%)",
						"--border-color": "var(--color-neutral-800)",
						"--hover-bg-color":
							"color-mix(in oklab, var(--color-neutral-800) 100% , black 50%)",
						"--hover-border-color":
							"color-mix(in oklab, var(--color-neutral-700) 100% , black 50%)",
					}}
					onclick={props.onBack}
				>
					<PlusIcon class="h-4 w-4" />
					New realm
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-8">
				<div class="grid gap-4">
					<For each={props.realms()}>
						{(realm) => (
							<Motion.div
								initial={{
									opacity: 0,
									y: 10,
								}}
								animate={{
									opacity: 1,
									y: 0,
								}}
								class="group relative overflow-hidden rounded-xl bg-white/5 p-6"
							>
								<div class="relative flex items-center justify-between">
									<div class="flex gap-6">
										<div
											class="flex h-20 w-12 items-center justify-center rounded-md border-b-2"
											style={{
												background: `color-mix(in oklab, ${realm.colors.secondary}, transparent)`,
												"border-color":
													realm.colors.secondary,
											}}
										>
											<HollowIcon
												class="selector-logo size-8"
												style={{
													"--color":
														realm.colors.primary,
												}}
											/>
										</div>
										<div class="my-auto flex flex-col gap-1">
											<div class="flex items-center gap-3">
												<h2 class="text-lg font-medium text-white">
													{realm.name}
												</h2>
												<div class="flex gap-1.5">
													<div
														class="h-2.5 w-2.5 rounded-full"
														style={{
															"background-color":
																realm.colors
																	.primary,
														}}
														title="Primary color"
													/>
													<div
														class="h-2.5 w-2.5 rounded-full"
														style={{
															"background-color":
																realm.colors
																	.secondary,
														}}
														title="Secondary color"
													/>
												</div>
											</div>
											<div class="flex flex-col gap-1 text-xs tracking-wider text-neutral-400 uppercase">
												<div class="flex gap-1">
													<CalendarIcon class="h-3 w-3" />
													<span
														title={
															realm.lastEntered
														}
													>
														{timeDifference(
															realm.lastEntered,
														)}
													</span>
												</div>
												<span>
													Created{" "}
													{formatDate(
														realm.createdDate,
													)}
												</span>
											</div>
										</div>
									</div>
									<div class="flex flex-col items-center gap-1">
										<button
											class="button-control"
											style={{
												"--color":
													"var(--color-neutral-500)",
												"--bg": "var(--color-neutral-700)",
											}}
											onclick={() =>
												props.onSelect(realm.id)
											}
										>
											<RocketIcon />
										</button>
										<button
											class="button-control red"
											onclick={() =>
												removeRealm(
													realm.id,
													props.setRealms,
												)
											}
										>
											<Trash2Icon />
										</button>
									</div>
								</div>
							</Motion.div>
						)}
					</For>
				</div>
			</div>
		</Motion.div>
	);
};

const CreateRealm = (props: { onBack: () => void; onSuccess: () => void }) => {
	const {
		name,
		setName,
		primary,
		setPrimary,
		secondary,
		setSecondary,
		createRealm,
	} = useRealmManager();

	const handleSubmit = () => {
		if (createRealm()) {
			props.onSuccess();
		}
	};

	const selectTheme = (name: string) => {
		const t = themes.find((i) => i.name === name);
		setPrimary(t.primary);
		setSecondary(t.secondary);
	};

	return (
		<Motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			class="up-pop flex h-fit w-210 flex-col"
			style={{
				"--bg-color": "var(--color-neutral-950)",
				"--border-color": "var(--color-neutral-900)",
				"--position": "relative",
			}}
		>
			<div class="title-panel flex items-center gap-2">
				<button
					class="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
					onclick={props.onBack}
				>
					<ArrowLeftIcon class="h-5 w-5" />
				</button>
				<h1 class="h1-title">Create realm</h1>
			</div>

			<div class="flex flex-1 gap-5 p-5">
				<div class="flex w-[400px] flex-col gap-8">
					<div class="flex h-full flex-col gap-6 py-5">
						<div class="flex flex-col gap-2">
							<label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
								Realm Name
							</label>
							<input
								placeholder="e.g., saturn"
								value={name()}
								onchange={(e) => {
									if (
										/^[A-Za-z]+$/.test(
											e.currentTarget.value,
										)
									) {
										setName(e.currentTarget.value);
									}
								}}
								pattern="^[A-Za-z]+$"
								title="e.g., Dark, light, sky..."
								class="rounded-xl bg-white/5 px-4 py-3 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white/20 focus:outline-none"
							/>
						</div>
						<div class="flex items-center justify-between">
							<label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
								Themes
							</label>
							<Dropdown
								// TODO light/dark gruops
								options={() => [
									{
										items: themes.map((i) => i.name),
									},
								]}
								onSelect={selectTheme}
								placeholder="Select A Theme"
							/>
						</div>
						<div class="flex items-center justify-between">
							<label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
								Primary Color
							</label>
							<ColorPick
								color={primary}
								setColor={setPrimary}
								borderColor={"var(--color-neutral-800)"}
							/>
						</div>
						<div class="flex items-center justify-between">
							<label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
								Secondary Color
							</label>
							<ColorPick
								color={secondary}
								setColor={setSecondary}
								borderColor={"var(--color-neutral-800)"}
							/>
						</div>
					</div>
					<button
						class="button-empty mt-auto ml-auto flex items-center gap-1 tracking-wide text-white"
						style={{
							"--bg-color": "var(--color-neutral-900)",
							"--border-color": "var(--color-neutral-800)",
							"--hover-bg-color":
								"color-mix(in oklab, var(--color-neutral-800) 100% , black 50%)",
							"--hover-border-color":
								"color-mix(in oklab, var(--color-neutral-700) 100% , black 50%)",
						}}
						onclick={handleSubmit}
					>
						Create Realm
					</button>
				</div>
				<hr class="h-full border-l border-dashed border-neutral-900" />
				<div class="flex h-fit items-center justify-center pt-5">
					<div class="flex flex-col gap-6">
						<div
							class="relative h-64 w-96 overflow-hidden rounded-2xl shadow-xl"
							style={{
								background: secondary(),
							}}
						>
							<div class="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent" />

							{/* Top Bar */}
							<div class="relative flex items-center justify-between p-4">
								<div class="flex items-center gap-2">
									<OrbitIcon
										class="h-5 w-5"
										style={{
											color: primary(),
										}}
									/>
									<span
										class="text-sm font-medium"
										style={{
											color: primary(),
										}}
									>
										{name() || "NEW REALM"}
									</span>
								</div>
								<div
									class="h-2 w-2 rounded-full"
									style={{
										background: primary(),
									}}
								/>
							</div>

							{/* Content Area */}
							<div class="relative flex h-full flex-col items-center justify-center p-6">
								<div
									class="rounded-2xl border bg-black/10 p-4"
									style={{
										"border-color": `${primary()}40`,
									}}
								>
									<div class="flex items-center gap-3">
										<div
											class="h-8 w-8 rounded-lg"
											style={{
												background: primary(),
											}}
										/>
										<div class="space-y-1">
											<div
												class="h-2 w-24 rounded"
												style={{
													background: `${primary()}40`,
												}}
											/>
											<div
												class="h-2 w-16 rounded"
												style={{
													background: `${primary()}20`,
												}}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="text-center text-sm text-neutral-500">
							Preview of your realm's appearance
						</div>
					</div>
				</div>
			</div>
		</Motion.div>
	);
};

function CreateCharacter(props: { onSuccess: () => void }) {
	const [character, setCharacter] = createSignal<Character>(
		CharacterManager.getSelf().getCharacter(),
	);

	const importAvatar = async () => {
		hollow.events.emit("show-vault", {
			onSelect: (p) => {
				setCharacter((i) => ({ ...i, avatar: p }));
			},
		});
	};

	const save = () => {
		CharacterManager.getSelf().setCharacter(character());
		props.onSuccess();
	};

	return (
		<Motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			class="up-pop flex w-121 flex-col"
			style={{
				"--bg-color": "var(--color-neutral-950)",
				"--border-color": "var(--color-neutral-900)",
				"--position": "relative",
			}}
		>
			<div class="title-panel flex items-center gap-2">
				<PandaIcon class="text-secondary-50 m-1 h-5 w-5" />
				<h1 class="h1-title">Character Sheet</h1>
			</div>
			<div class="flex flex-col gap-3 p-3">
				<div class="flex justify-between">
					<p class="text-secondary-40 text-sm tracking-wider">
						Wait. You there. Step forward. Who are you?
					</p>
					<span class="text-secondary-40 tool-tip text-sm tracking-wider">
						<span class="tool-tip-content" data-side="right">
							The Characters feature is currently experimental. It
							doesn’t serve a specific purpose yet, but we wanted
							to introduce it and explore its potential. If, over
							time, it doesn’t provide value to most users, we may
							decide to remove it.
						</span>
						[ i ]
					</span>
				</div>
				<hr class="border-secondary bg-secondary-10/50 h-[2px] w-full" />
				<div class="flex gap-5">
					<div
						class="border-secondary-10 flex size-40 shrink-0 flex-col justify-between rounded border p-2"
						style={{
							"background-image": `url(${character().avatar})`,
							"background-size": "cover",
						}}
					>
						<Show when={!character().avatar}>
							<span class="text-secondary-20 w-full pt-10 text-center text-sm tracking-widest">
								AVATAR
							</span>
						</Show>
						<button
							class="button-secondary mt-auto"
							onclick={importAvatar}
							style={{ "--w": "100%" }}
						>
							import
						</button>
					</div>
					<div class="flex h-40 w-full flex-col justify-around gap-2">
						<div class="w-full">
							<h2 class="text-sm tracking-widest text-neutral-500 uppercase">
								Name
							</h2>
							<input
								class="input"
								placeholder="All realms remember a name"
								value={character().username}
								onInput={(e) =>
									setCharacter((prev) => ({
										...prev,
										username: e.currentTarget.value,
									}))
								}
							/>
						</div>
						<div class="w-full">
							<h2 class="text-sm tracking-widest text-neutral-500 uppercase">
								Title
							</h2>
							<Dropdown
								value={() => character().title}
								options={() => [
									{
										items: ["Elder", "The Original Few"],
									},
								]}
								onSelect={(s: string) =>
									setCharacter((prev) => ({
										...prev,
										title: s,
									}))
								}
							/>
						</div>
					</div>
				</div>
				<div>
					<h2 class="text-sm tracking-widest text-neutral-500 uppercase">
						Description
					</h2>
					<textarea
						class="input resize-none"
						placeholder="Your tale begins here"
						value={character().bio}
						onInput={(e) =>
							setCharacter((prev) => ({
								...prev,
								bio: e.currentTarget.value,
							}))
						}
					/>
				</div>

				<hr class="border-secondary bg-secondary-10/50 mx-auto h-[2px] w-full" />
				<div class="flex w-full flex-wrap items-center gap-2">
					<h2 class="text-sm tracking-widest text-neutral-500 uppercase">
						achievements :
					</h2>
					<For each={["🌀 First Step"]}>
						{(ach) => (
							<span class="bg-secondary-10 text-secondary-70 rounded px-2">
								{ach}
							</span>
						)}
					</For>
				</div>
				<hr class="border-secondary bg-secondary-10/50 mx-auto h-[2px] w-full" />
			</div>
			<div class="mx-5 mb-5 flex gap-2">
				<button
					class="button-primary"
					onclick={save}
					style={{ "--w": "100%" }}
				>
					Save
				</button>
				<button
					class="button-secondary"
					onclick={() => props.onSuccess()}
					style={{ "--w": "100%" }}
				>
					Skip
				</button>
			</div>
		</Motion.div>
	);
}

export default function Selector({ onSelect }: SelectorProps) {
	const [ready] = createResource(async () => {
		useColor({ name: "primary", color: "#FF0033", oneTime: true });
		useColor({ name: "secondary", color: "#000000", oneTime: true });
		return true;
	});
	const [level, setLevel] = createSignal(
		RealmManager.getSelf().realms.length === 0 ? 0 : 1,
	);
	const [realms, setRealms] = createSignal<Realm[]>(
		RealmManager.getSelf().realms,
	);
	//
	return (
		<Suspense fallback={<Loading />}>
			<Show when={ready()}>
				<div class="flex h-full w-full items-center justify-center bg-neutral-950">
					<div class="absolute top-2 right-2 z-10">
						<WindowControl expanded />
					</div>
					<div class="flex h-[90%] w-[95%] items-center justify-center">
						<div class="h-fit w-fit">
							<Presence exitBeforeEnter>
								<Show when={level() === 0}>
									<WelcomeScreen onNext={() => setLevel(3)} />
								</Show>

								<Show when={level() === 1}>
									<RealmList
										onBack={() => setLevel(2)}
										onSelect={(id) => {
											onSelect(id);
										}}
										realms={realms}
										setRealms={setRealms}
									/>
								</Show>

								<Show when={level() === 2}>
									<CreateRealm
										onBack={() => setLevel(1)}
										onSuccess={() => setLevel(1)}
									/>
								</Show>

								<Show when={level() === 3}>
									<CreateCharacter
										onSuccess={() => setLevel(2)}
									/>
								</Show>
							</Presence>
						</div>
					</div>
				</div>
			</Show>
		</Suspense>
	);
}
