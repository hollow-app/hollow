import ColorPick from "@components/dynamic/ColorPick";
import { formatDate, timeDifference } from "@utils/manipulation/strings";
import { Realm } from "@type/Realm";
import HollowIcon from "@assets/logo.svg";
import { CalendarIcon, PlusIcon, RocketIcon } from "lucide-solid";
import {
	Accessor,
	batch,
	createSignal,
	For,
	onMount,
	Setter,
	Show,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";
import WindowControl from "@components/ui/WindowControl";
import Dropdown from "@components/dynamic/Dropdown";
import { open } from "@tauri-apps/plugin-dialog";
import MyIcon from "@components/ui/MyIcon";
import { homeDir } from "@tauri-apps/api/path";
import Segmented from "@components/dynamic/Segmented";
import { useStore } from "./store";

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
	const { state, dispatch } = useStore();
	const [name, setName] = createSignal("");
	const [location, setLocation] = createSignal("");
	const [primary, setPrimary] = createSignal("#FFFFFF");
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
		dispatch({
			domain: "realm",
			type: "add-realm",
			realm: newRealm,
		});
		return true;
	};

	const removeRealm = (id: string) => {
		const handleDecision = () => {
			dispatch({
				domain: "realm",
				type: "remove-realm",
				realmId: id,
			});
		};
		// Simple confirm dialog since hollow might not be available
		if (
			confirm(
				`Are you sure you want to remove ${state.realm.realms.find((i) => i.id === id).name} Realm?`,
			)
		) {
			handleDecision();
		}
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
	onSelect: (id: string) => void;
	onCreateRealm: () => void;
}) => {
	const { state, dispatch } = useStore();
	const { removeRealm } = useRealmManager();

	return (
		<Motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
			transition={{ duration: 0.3 }}
			class="relative h-full w-full flex-col overflow-hidden"
		>
			{/* Content */}
			<div class="h-full w-full overflow-hidden overflow-y-auto p-8">
				<Show
					when={state.realm.realms.length > 0}
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
								class="button secondary mt-2 flex items-center gap-2"
								onclick={props.onCreateRealm}
							>
								<PlusIcon class="mr-2 h-4 w-4" />
								Create Realm
							</button>
						</div>
					}
				>
					<div
						class="flex w-full flex-col gap-px"
						style={{
							background:
								"linear-gradient(to right, transparent, var(--color-secondary-10), transparent)",
						}}
					>
						<For each={state.realm.realms}>
							{(realm) => (
								<div class="group bg-secondary border-secondary-10 hover:border-secondary-15 relative w-full overflow-hidden p-6 transition-all">
									<div class="flex items-center justify-between gap-6">
										<div class="flex min-w-0 flex-1 items-center gap-4">
											<div
												class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
												style={{
													background:
														realm.colors.secondary,
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
														removeRealm(realm.id)
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
									</div>
								</div>
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
			alert(
				"Invalid Location: Please select a folder inside your home directory.",
			);
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
			class="relative flex h-full w-full flex-col p-10"
		>
			<div class="flex flex-1 gap-12">
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

export default function SelectorWindow() {
	const { state, dispatch } = useStore();
	const [level, setLevel] = createSignal(
		state.realm.realms.length > 0 ? 1 : 0,
	);
	const handleSelect = async (id: string) => {
		// Update realm in manager
		// TODO, the async back to stop the loading proces??
		dispatch({
			domain: "realm",
			type: "enter-realm",
			realmId: id,
		});
	};

	return (
		<div class="h-full w-full overflow-hidden">
			<div class="titlebar bg-secondary-05 flex justify-end rounded">
				<WindowControl expanded isSelector />
			</div>
			<div class="box-border flex h-full w-full flex-col px-5 pb-5">
				<div class="flex h-fit min-h-14 w-full items-center justify-between gap-10 overflow-hidden">
					<div class="flex-1">
						<Show when={level() !== 0}>
							<Segmented
								value={level()}
								options={[
									{ key: 1, title: "Realm List" },
									{ key: 2, title: "Create Realm" },
								]}
								setValue={(v: number) => setLevel(v)}
								direct
							/>
						</Show>
					</div>
				</div>
				<div class="flex w-full flex-1 items-center justify-center overflow-hidden">
					<Presence exitBeforeEnter>
						<Show when={level() === 0}>
							<WelcomeScreen onNext={() => setLevel(1)} />
						</Show>

						<Show when={level() === 1}>
							<RealmList
								onSelect={handleSelect}
								onCreateRealm={() => setLevel(2)}
							/>
						</Show>

						<Show when={level() === 2}>
							<CreateRealm
								onBack={() => setLevel(1)}
								onSuccess={() => {
									setLevel(1);
								}}
							/>
						</Show>
					</Presence>
				</div>
			</div>
		</div>
	);
}
