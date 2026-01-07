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
		initial={{ opacity: 0, scale: 0.95 }}
		animate={{ opacity: 1, scale: 1 }}
		exit={{ opacity: 0, scale: 0.95 }}
		transition={{ duration: 0.4 }}
		class="relative flex h-full w-full items-center justify-center"
	>
		<div class="relative flex max-w-2xl flex-col items-center gap-8 px-8 text-center">
			<div class="mb-4 flex items-center justify-center">
				<div class="relative">
					<div class="bg-secondary-20 absolute inset-0 animate-pulse rounded-full blur-2xl" />
					<HollowIcon class="relative size-30 text-white" />
				</div>
			</div>
			<div class="space-y-4">
				<h1 class="text-5xl font-bold tracking-tight text-white sm:text-6xl">
					Welcome to Hollow
				</h1>
				<p class="text-secondary-60 mx-auto max-w-lg text-lg leading-relaxed">
					Your personal space for exploration, imagination, and
					creation. Let's begin your journey.
				</p>
			</div>
			<button class="button primary mt-4" onclick={props.onNext}>
				Get Started
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
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
			transition={{ duration: 0.3 }}
			class="border-secondary-10 bg-secondary relative flex max-w-5xl flex-col overflow-hidden rounded-2xl border"
			style={{
				"--bg-color": "var(--color-secondary)",
				"--border-color": "var(--color-secondary-10)",
			}}
		>
			{/* Header */}
			<div class="border-secondary-10 flex items-center justify-between border-b px-8 py-6">
				<div class="space-y-1">
					<h1 class="text-xl font-medium text-white">Realms</h1>
					<p class="text-secondary-60 text-sm font-normal">
						Choose a realm to continue
					</p>
				</div>
				<button
					class="button secondary flex items-center gap-2"
					onclick={props.onBack}
				>
					<PlusIcon class="h-4 w-4" />
					New Realm
				</button>
			</div>

			{/* Content */}
			<div class="flex-1 overflow-y-auto p-8">
				<Show
					when={props.realms().length > 0}
					fallback={
						<div class="flex min-h-[500px] flex-col items-center justify-center gap-6 py-16">
							<div class="bg-secondary-05 rounded-2xl p-8">
								<HollowIcon class="text-secondary-40 size-16" />
							</div>
							<div class="space-y-2 text-center">
								<h3 class="text-base font-medium text-white">
									No realms available
								</h3>
								<p class="text-secondary-60 max-w-md text-sm leading-relaxed">
									Create your first realm to organize your
									workspace and begin your journey
								</p>
							</div>
							<button
								class="button secondary mt-2"
								onclick={props.onBack}
							>
								<PlusIcon class="mr-2 h-4 w-4" />
								Create Realm
							</button>
						</div>
					}
				>
					<div class="grid gap-3">
						<For each={props.realms()}>
							{(realm) => (
								<Motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.2 }}
									class="group border-secondary-10 bg-secondary-05 hover:border-secondary-15 hover:bg-secondary-10 relative overflow-hidden rounded-xl border p-6 transition-all"
								>
									<div class="flex items-center justify-between gap-6">
										<div class="flex min-w-0 flex-1 items-center gap-4">
											<div
												class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
												style={{
													background: `color-mix(in oklab, ${realm.colors.secondary} 15%, transparent)`,
												}}
											>
												<HollowIcon
													class="size-7"
													style={{
														color: realm.colors
															.primary,
													}}
												/>
											</div>
											<div class="min-w-0 flex-1 space-y-2">
												<div class="flex items-center gap-3">
													<h3 class="text-base font-medium text-white">
														{realm.name}
													</h3>
													<div class="flex gap-1.5">
														<div
															class="h-1.5 w-1.5 rounded-full"
															style={{
																"background-color":
																	realm.colors
																		.primary,
															}}
															title="Primary color"
														/>
														<div
															class="h-1.5 w-1.5 rounded-full"
															style={{
																"background-color":
																	realm.colors
																		.secondary,
															}}
															title="Secondary color"
														/>
													</div>
												</div>
												<div class="text-secondary-60 flex items-center gap-4 text-xs">
													<div class="flex items-center gap-1.5">
														<CalendarIcon class="h-3.5 w-3.5" />
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
													<span class="text-secondary-50">
														{formatDate(
															realm.createdDate,
														)}
													</span>
												</div>
											</div>
										</div>
										<div class="flex shrink-0 items-center gap-2">
											<button
												class="button secondary flex items-center gap-2"
												onclick={() =>
													props.onSelect(realm.id)
												}
											>
												<RocketIcon class="h-4 w-4" />
												Enter
											</button>
											<button
												class="button-control red"
												onclick={() =>
													removeRealm(
														realm.id,
														props.setRealms,
													)
												}
												title="Delete realm"
											>
												<MyIcon
													name="trash"
													class="size-4"
												/>
											</button>
										</div>
									</div>
								</Motion.div>
							)}
						</For>
					</div>
				</Show>
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
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
			transition={{ duration: 0.3 }}
			class="border-secondary-10 bg-secondary relative flex w-fit flex-col overflow-hidden rounded-2xl border"
			style={{
				"--bg-color": "var(--color-secondary)",
				"--border-color": "var(--color-secondary-10)",
			}}
		>
			{/* Header */}
			<div class="border-secondary-10 flex items-center gap-4 border-b px-2 py-2">
				<button
					class="text-secondary-60 hover:bg-secondary-10 rounded-lg p-2 transition-colors hover:text-white"
					onclick={props.onBack}
				>
					<ArrowLeftIcon class="h-5 w-5" />
				</button>
				<div class="space-y-1">
					<h1 class="text-xl font-medium text-white">Create Realm</h1>
				</div>
			</div>

			<div class="flex flex-1 gap-12 p-8">
				{/* Form Section */}
				<div class="flex w-full max-w-lg flex-col gap-8">
					<div class="space-y-6">
						{/* Realm Name */}
						<div class="space-y-2.5">
							<label class="text-secondary-60 text-sm font-medium">
								Realm Name <span class="text-primary">*</span>
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
								title="Only letters are allowed"
								class="input"
							/>
						</div>

						{/* Location */}
						<div class="space-y-2.5">
							<label class="text-secondary-60 text-sm font-medium">
								Location <span class="text-primary">*</span>
							</label>
							<div class="flex gap-2">
								<input
									readonly
									value={location() || "No location selected"}
									class="input flex-1"
									classList={{
										"text-secondary-50": !!location(),
										"text-secondary-40": !location(),
									}}
								/>
								<button
									class="button secondary whitespace-nowrap"
									onclick={selectLocation}
								>
									Browse
								</button>
							</div>
						</div>

						{/* Theme */}
						<div class="space-y-2.5">
							<label class="text-secondary-60 text-sm font-medium">
								Theme Preset
							</label>
							<Dropdown
								options={[
									{
										title: "Light",
										items: themes.light.map((i) => i.name),
									},
									{
										title: "Dark",
										items: themes.dark.map((i) => i.name),
									},
								]}
								onSelect={selectTheme}
								placeholder="Select a theme"
								visibleOnSelect
							/>
						</div>

						{/* Colors */}
						<div class="space-y-5">
							<div class="flex items-center justify-between space-y-2.5">
								<label class="text-secondary-60 text-sm font-medium">
									Primary Color
								</label>
								<div class="flex items-center gap-3">
									<ColorPick
										color={primary()}
										setColor={setPrimary}
										direct
									/>
								</div>
							</div>
							<div class="flex items-center justify-between space-y-2.5">
								<label class="text-secondary-60 text-sm font-medium">
									Secondary Color
								</label>
								<div class="flex items-center gap-3">
									<ColorPick
										color={secondary()}
										setColor={setSecondary}
										direct
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<button
						class="button primary mt-4 w-full"
						onclick={handleSubmit}
					>
						Create Realm
					</button>
				</div>

				{/* Preview Section */}
				<div class="border-secondary-10 flex flex-1 items-center justify-center border-l pl-8">
					<div class="flex flex-col gap-4">
						<div
							class="border-secondary-15 relative h-72 w-70 overflow-hidden rounded-xl border"
							style={{
								background: secondary(),
							}}
						>
							{/* Top Bar */}
							<div class="border-secondary-15 flex items-center justify-between border-b px-4 py-2.5">
								<div class="flex items-center gap-2">
									<HollowIcon
										class="h-4 w-4"
										style={{
											color: primary(),
										}}
									/>
									<span
										class="text-xs font-medium"
										style={{
											color: primary(),
										}}
									>
										{name() || "NEW REALM"}
									</span>
								</div>
								<div
									class="h-1.5 w-1.5 rounded-full"
									style={{
										background: primary(),
									}}
								/>
							</div>

							{/* Content Area */}
							<div class="flex h-full flex-col items-center justify-center p-5">
								<div
									class="rounded-lg border p-3"
									style={{
										"border-color": `${primary()}30`,
										background: `color-mix(in oklab, ${primary()} 8%, transparent)`,
									}}
								>
									<div class="flex items-center gap-2.5">
										<div
											class="h-6 w-6 rounded-md"
											style={{
												background: primary(),
											}}
										/>
										<div class="space-y-1">
											<div
												class="h-1.5 w-20 rounded"
												style={{
													background: `${primary()}50`,
												}}
											/>
											<div
												class="h-1.5 w-14 rounded"
												style={{
													background: `${primary()}35`,
												}}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
						<p class="text-secondary-60 text-center text-xs">
							Preview
						</p>
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
		useColor({ name: "primary", color: "#FFFFFF", oneTime: true });
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
				<div class="bg-secondary flex h-full w-full items-center justify-center p-8">
					<div class="absolute top-4 right-4 z-10">
						<WindowControl expanded />
					</div>
					<div class="flex w-full max-w-7xl items-center justify-center">
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
									onSuccess={() => {
										setRealms(manager.realm.getRealms());
										setLevel(1);
									}}
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
			</Show>
		</Suspense>
	);
}
