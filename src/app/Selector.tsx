import ColorPick from "@components/dynamic/ColorPick";
import { formatDate, timeDifference } from "@utils/manipulation/strings";
import { Realm } from "@type/Realm";
import HollowIcon from "@assets/logo.svg";
import {
	CalendarIcon,
	PlusIcon,
	ArrowLeftIcon,
	RocketIcon,
	PandaIcon,
} from "lucide-solid";
import {
	Accessor,
	batch,
	createResource,
	createSignal,
	For,
	onMount,
	Setter,
	Show,
	Suspense,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import WindowControl from "@components/WindowControl";
import { Character } from "@type/Character";
import { manager } from "@managers/index";
import { useColor } from "@hooks/useColor";
import Loading from "@components/Loading";
import { hollow } from "hollow";
import Dropdown from "@components/dynamic/Dropdown";
import { open } from "@tauri-apps/plugin-dialog";
import MyIcon from "@components/MyIcon";
import { homeDir } from "@tauri-apps/api/path";

type SelectorProps = {
	onSelect: (id: string) => void;
};

const themes = {
	dark: [
		{ name: "Midnight Ink", primary: "#E6EDF3", secondary: "#0E1116" },
		{ name: "Graphite", primary: "#D1D5DB", secondary: "#15181D" },
		{ name: "Sepia Night", primary: "#E7D8C5", secondary: "#1A1410" },
		{ name: "OLED Paper", primary: "#FFFFFF", secondary: "#000000" },
		{ name: "Deep Navy", primary: "#DCE6F0", secondary: "#0B1220" },
	],
	light: [
		{ name: "Paper", primary: "#1F2937", secondary: "#FAFAF7" },
		{ name: "Parchment", primary: "#3A2F2A", secondary: "#F4ECD8" },
		{ name: "Ivory", primary: "#2A2A2A", secondary: "#FFFDF7" },
		{ name: "Sepia", primary: "#4B3621", secondary: "#F6EFE4" },
		{ name: "Cloud", primary: "#1E293B", secondary: "#F3F4F6" },
		{ name: "Mint Paper", primary: "#1F3A2E", secondary: "#F0FAF6" },
	],
};

const useRealmManager = () => {
	const [name, setName] = createSignal("");
	const [location, setLocation] = createSignal("");
	const [primary, setPrimary] = createSignal("#FF0033");
	const [secondary, setSecondary] = createSignal("#000000");

	const createRealm = () => {
		if (!name() || !location()) return false;
		const newRealm: Realm = {
			id: crypto.randomUUID(),
			name: name(),
			location: location(),
			lastEntered: new Date().toISOString(),
			createdDate: new Date().toISOString(),
			colors: {
				primary: primary(),
				secondary: secondary(),
			},
		};
		manager.realm.addRealm(newRealm);
		return true;
	};

	const removeRealm = (id: string, setRealms: Setter<Realm[]>) => {
		const handleDecision = () => {
			manager.realm.removeRealm(id);
			setRealms((prev) => prev.filter((r) => r.id !== id));
		};
		hollow.events.emit("confirm", {
			title: "warning",
			message: `Are you sure you want to remove ${manager.realm.getRealmFromId(id)?.name} Realm?`,
			onAccept: handleDecision,
		});
	};

	return {
		name,
		setName,
		location,
		setLocation,
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
		<div class="relative flex w-fit flex-col items-center select-none">
			<div class="rotate-[10deg]">
				<h1 class="mt-8 text-6xl font-black tracking-tight text-white">
					Hello, adventurer!
				</h1>
				<h1 class="text-secondary-60 mt-2 w-150 text-lg tracking-widest uppercase">
					Hollow is ready to help you explore, imagine, and create.
					Let’s dive in!
				</h1>
			</div>
			<button
				class="button primary mt-7 ml-auto flex items-center gap-3 text-black"
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
			class="up-pop flex h-170 w-160 flex-col overflow-hidden"
			style={{
				"--bg-color": "var(--color-secondary)",
				"--border-color": "var(--color-secondary-10)",
				"--position": "relative",
			}}
		>
			<div class="title-panel flex items-center justify-between">
				<h1 class="h1-title">Realms</h1>
				<button
					class="button empty flex items-center gap-1 tracking-wide text-white"
					style={{
						"--bg-color":
							"color-mix(in oklab, var(--color-secondary-20) 100% , black 30%)",
						"--border-color": "var(--color-secondary-20)",
						"--hover-bg-color":
							"color-mix(in oklab, var(--color-secondary-20) 100% , black 50%)",
						"--hover-border-color":
							"color-mix(in oklab, var(--color-secondary-30) 100% , black 50%)",
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
												class="size-8"
												style={{
													color: realm.colors.primary,
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
											<div class="text-secondary-60 flex flex-col gap-1 text-xs tracking-wider uppercase">
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
													"var(--color-secondary-50)",
												"--bg": "var(--color-secondary-30)",
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
											<MyIcon
												name="trash"
												class="size-5"
											/>
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
		location,
		setLocation,
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
	const flatThemes = Object.entries(themes).flatMap(([k, v]) => v);

	const selectTheme = (name: string) => {
		const t = flatThemes.find((i) => i.name === name);
		batch(() => {
			setPrimary(t.primary);
			setSecondary(t.secondary);
		});
	};

	let home = null;
	const selectLocation = async () => {
		if (!home) return;
		const path = await open({
			directory: true,
			multiple: false,
			title: "Select Realm Location",
		});
		if (!path) return;
		const normalizedPath = path.replace(/\\/g, "/");
		const normalizedHome = home.replace(/\\/g, "/");
		if (
			!normalizedPath.startsWith(normalizedHome + "/") &&
			normalizedPath !== normalizedHome
		) {
			hollow.events.emit("alert", {
				type: "warning",
				title: "Invalid Location",
				message: "Please select a folder inside your home directory.",
			});
			return;
		}
		setLocation(path);
	};

	onMount(async () => {
		home = await homeDir();
	});

	return (
		<Motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			class="up-pop flex h-fit w-210 flex-col overflow-hidden"
			style={{
				"--bg-color": "var(--color-secondary)",
				"--border-color": "var(--color-secondary-10)",
				"--position": "relative",
			}}
		>
			<div class="title-panel flex items-center gap-2">
				<button
					class="text-secondary-60 rounded-full p-2 transition-colors hover:bg-white/5 hover:text-white"
					onclick={props.onBack}
				>
					<ArrowLeftIcon class="h-5 w-5" />
				</button>
				<h1 class="h1-title">Create realm</h1>
			</div>

			<div class="flex flex-1 gap-5 px-5">
				<div class="border-secondary-10 flex w-[400px] flex-col gap-8 border-r border-dashed py-5 pr-5">
					<div class="flex h-full flex-col gap-6 py-5">
						<div class="flex flex-col gap-2">
							<label class="text-secondary-60 text-sm font-medium tracking-wider uppercase">
								Realm Name{" "}
								<span class="text-primary text-xs">*</span>
							</label>
							<input
								placeholder="e.g., saturn"
								value={name()}
								oninput={(e) => {
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
								class="input"
							/>
						</div>
						<div class="flex items-center justify-between">
							<label class="text-secondary-60 flex flex-col text-sm font-medium tracking-wider uppercase">
								<div>
									Location
									<span class="text-primary text-xs">*</span>
								</div>
								<Show when={location()}>
									<span class="text-secondary-50 truncate text-xs">
										[{location()}]
									</span>
								</Show>
							</label>
							<button
								class="button secondary"
								onclick={selectLocation}
							>
								Select
							</button>
						</div>
						<div class="flex items-center justify-between">
							<label class="text-secondary-60 text-sm font-medium tracking-wider uppercase">
								Themes
							</label>
							<div class="w-50">
								<Dropdown
									options={[
										{
											title: "Light",
											items: themes.light.map(
												(i) => i.name,
											),
										},
										{
											title: "Dark",
											items: themes.dark.map(
												(i) => i.name,
											),
										},
									]}
									onSelect={selectTheme}
									placeholder="Select A Theme"
									visibleOnSelect
								/>
							</div>
						</div>
						<div class="flex items-center justify-between">
							<label class="text-secondary-60 text-sm font-medium tracking-wider uppercase">
								Primary Color
							</label>
							<ColorPick
								color={primary()}
								setColor={setPrimary}
								direct
							/>
						</div>
						<div class="flex items-center justify-between">
							<label class="text-secondary-60 text-sm font-medium tracking-wider uppercase">
								Secondary Color
							</label>
							<ColorPick
								color={secondary()}
								setColor={setSecondary}
								direct
							/>
						</div>
					</div>
					<button
						class="button empty mt-auto ml-auto flex items-center gap-1 tracking-wide text-white"
						style={{
							"--bg-color": "var(--color-secondary-10)",
							"--border-color": "var(--color-secondary-20)",
							"--hover-bg-color":
								"color-mix(in oklab, var(--color-secondary-20) 100% , black 50%)",
							"--hover-border-color":
								"color-mix(in oklab, var(--color-secondary-30) 100% , black 50%)",
						}}
						onclick={handleSubmit}
					>
						Create Realm
					</button>
				</div>
				<div class="flex h-fit items-center justify-center pt-5">
					<div class="m-auto flex flex-col gap-6">
						<div
							class="border-secondary-05 relative h-64 w-96 overflow-hidden rounded-2xl border shadow-xl"
							style={{
								background: secondary(),
							}}
						>
							{/* Top Bar */}
							<div class="relative flex items-center justify-between p-4">
								<div class="flex items-center gap-2">
									<HollowIcon
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

						<div class="text-secondary-50 text-center text-sm">
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
		manager.character.get,
	);

	const importAvatar = async () => {};

	const save = () => {
		manager.character.set = character();
		props.onSuccess();
	};

	return (
		<Motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			class="up-pop flex w-121 flex-col overflow-hidden"
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
						<input
							class="input mt-auto"
							placeholder="https://"
							oninput={(e) =>
								setCharacter((p) => ({
									...p,
									avatar: e.currentTarget.value,
								}))
							}
						/>
					</div>
					<div class="flex h-40 w-full flex-col justify-around gap-2">
						<div class="w-full space-y-2">
							<h2 class="text-sm tracking-widest text-neutral-500 uppercase">
								Name
							</h2>
							<input
								class="input"
								placeholder="All realms remember a name"
								value={character().name}
								onInput={(e) =>
									setCharacter((prev) => ({
										...prev,
										name: e.currentTarget.value,
									}))
								}
							/>
						</div>
						<div class="w-full space-y-2">
							<h2 class="text-sm tracking-widest text-neutral-500 uppercase">
								Title
							</h2>
							<Dropdown
								value={character().title}
								options={[
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
				<div class="space-y-2">
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
					class="button primary"
					onclick={save}
					style={{ "--w": "100%" }}
				>
					Save
				</button>
				<button
					class="button secondary"
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
		useColor({ name: "secondary", color: "#0b0b0b", oneTime: true });
		useColor({ name: "primary", color: "#FF0033", oneTime: true });
		return true;
	});
	const [realms, setRealms] = createSignal<Realm[]>(
		manager.realm.getRealms(),
	);
	const [level, setLevel] = createSignal(realms().length === 0 ? 0 : 1);
	//
	return (
		<Suspense fallback={<Loading />}>
			<Show when={ready()}>
				<div class="bg-secondary flex h-full w-full items-center justify-center">
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
