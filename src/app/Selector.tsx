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
} from "lucide-solid";
import { Accessor, createSignal, For, Setter, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";
import { confirmThis } from "@managers/manipulation/popups";
import WindowControl from "@components/ui/WindowControl";

type SelectorProps = {
	onSelect: Setter<string | null>;
};

const themes = [
	{ name: "Blaze", primary: "#FF6B6B", secondary: "#1A1A1A" },
	{ name: "Abyss", primary: "#1A535C", secondary: "#F0F5F5" },
	{ name: "Solar", primary: "#FFD93D", secondary: "#2C2C2C" },
	{ name: "Mint", primary: "#2EC4B6", secondary: "#0B3D2E" },
	{ name: "Cherry", primary: "#FF3C38", secondary: "#2E1A1A" },
	{ name: "Twilight", primary: "#6A4C93", secondary: "#EAE6F8" },
	{ name: "Amber", primary: "#FFBF69", secondary: "#3C2F1F" },
	{ name: "Cobalt", primary: "#1982C4", secondary: "#E0F0FA" },
	{ name: "Onyx", primary: "#1A1A1A", secondary: "#FFB6B6" },
	{ name: "Lime", primary: "#B8E986", secondary: "#2F3B20" },
];
const useRealmManager = () => {
	const [name, setName] = createSignal("");
	const [primary, setPrimary] = createSignal("#1ab1ff");
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
		window.realmManager.addRealm(newRealm);
		return true;
	};

	const removeRealm = (id: string, setRealms: Setter<Realm[]>) => {
		const handleDecision = (d: boolean) => {
			if (d) {
				window.realmManager.removeRealm(id);
				setRealms((prev) => prev.filter((r) => r.id !== id));
			}
		};
		confirmThis(
			{
				type: "warning",
				message: `Are you sure you want to remove ${window.realmManager.getRealmFromId(id)?.name} Realm?`,
			},
			handleDecision,
		);
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
	<Motion
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		transition={{ duration: 0.3 }}
		class="relative flex h-full w-full items-center justify-center overflow-hidden"
	>
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black" />
		<div class="relative flex w-fit flex-col items-center">
			<div>
				<h1 class="mt-8 text-6xl font-black tracking-tight text-white">
					Hello, adventurer!
				</h1>
				<h1 class="mt-2 text-lg w-150 tracking-widest text-neutral-400 uppercase">
					Hollow is ready to help you explore, imagine, and create.
					Let’s dive in!
				</h1>
			</div>
			<button
				class="button-primary mt-7 ml-auto flex items-center gap-3 text-black"
				onclick={props.onNext}
			>
				<RocketIcon class="size-5 hidden" />
				<span class="relative z-10">Start</span>
			</button>
		</div>
	</Motion>
);

const RealmList = (props: {
	onBack: () => void;
	onSelect: (id: string) => void;
	realms: Accessor<Realm[]>;
	setRealms: Setter<Realm[]>;
}) => {
	const { removeRealm } = useRealmManager();

	return (
		<Motion
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			class="flex h-170 flex-col w-160"
		>
			<div class="title-panel flex justify-between items-center">
				<h1>Realms</h1>
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
							<Motion
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
											class="flex h-20 w-12 items-center justify-center border-b-2 rounded-md"
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
										<div class="flex flex-col my-auto gap-1">
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
												"--color": "white",
												"--bg": "white",
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
							</Motion>
						)}
					</For>
				</div>
			</div>
		</Motion>
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

	return (
		<Motion
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			class="flex  h-120 w-210 flex-col"
		>
			<div class="title-panel flex items-center gap-2">
				<button
					class="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
					onclick={props.onBack}
				>
					<ArrowLeftIcon class="h-5 w-5" />
				</button>
				<h1>Create realm</h1>
			</div>

			<div class="flex flex-1 gap-5 p-8">
				<div class="flex w-[400px] flex-col gap-8">
					<div class="flex flex-col gap-6 h-full py-5">
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
						<div class="flex justify-between items-center">
							<label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
								Primary Color
							</label>
							<ColorPick
								color={primary()}
								setColor={setPrimary}
								borderColor={"var(--color-neutral-800)"}
							/>
						</div>
						<div class="flex justify-between items-center">
							<label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
								Secondary Color
							</label>
							<ColorPick
								color={secondary()}
								setColor={setSecondary}
								borderColor={"var(--color-neutral-800)"}
							/>
						</div>
					</div>
					<button
						class="button-empty ml-auto mt-auto flex items-center gap-1 tracking-wide text-white"
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
				<hr class="border-dashed border-l border-neutral-900 h-full" />
				<div class="flex items-center h-fit justify-center pt-5">
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
		</Motion>
	);
};

export default function Selector({ onSelect }: SelectorProps) {
	const [level, setLevel] = createSignal(
		// window.realmManager.realms.length === 0 ? 0 : 1,
		1,
	);
	const [realms, setRealms] = createSignal<Realm[]>(
		window.realmManager.realms,
	);

	return (
		<div class="flex h-full w-full items-center justify-center overflow-hidden bg-neutral-950">
			<div class="absolute top-2 right-2 z-10">
				<WindowControl expanded />
			</div>
			<div class="h-[90%] w-[95%] flex items-center justify-center">
				<div
					class="w-fit h-fit overflow-hidden"
					classList={{ "up-pop": level() !== 0 }}
					style={{
						"--bg-color": "var(--color-neutral-950)",
						"--border-color": "var(--color-neutral-900)",
					}}
				>
					<Presence exitBeforeEnter>
						<Show when={level() === 0}>
							<WelcomeScreen onNext={() => setLevel(2)} />
						</Show>

						<Show when={level() === 1}>
							<RealmList
								onBack={() => setLevel(2)}
								onSelect={(id) =>
									window.realmManager.enterRealm(id)
								}
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
					</Presence>
				</div>
			</div>
		</div>
	);
}
