import {
	ArrowDownUpIcon,
	BadgeInfoIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	FileCodeIcon,
	FileSlidersIcon,
	HousePlugIcon,
	KeyboardIcon,
	OrbitIcon,
	PaletteIcon,
	ShieldUserIcon,
	UserIcon,
	UserLockIcon,
	UserPenIcon,
	UsersIcon,
} from "lucide-solid";
import {
	Accessor,
	createMemo,
	createSignal,
	For,
	ParentComponent,
	Setter,
	Show,
	Suspense,
} from "solid-js";
import HollowIcon from "@assets/logo.svg";

import { Motion, Presence } from "solid-motionone";
import General from "./settings/General";
import { lazy } from "solid-js";
import { toggleRealm } from "@shared/managers/Realm";
import { useStore } from "@store";
import { Button } from "@ui";

const Plugins = lazy(() => import("./settings/Plugins"));
const Modifier = lazy(() => import("./settings/Modifier"));
const HotKeys = lazy(() => import("./settings/HotKeys"));
const Developers = lazy(() => import("./settings/Developers"));
const Appearance = lazy(() => import("./settings/Appearance"));
const About = lazy(() => import("./settings/About"));
const Account_Profile = lazy(() => import("./settings/Account/Profile"));
const Account_Relatinoship = lazy(
	() => import("./settings/Account/Relationship"),
);
const Account_Security = lazy(() => import("./settings/Account/Security"));
const Account_DangerZone = lazy(() => import("./settings/Account/DangerZone"));

type SettingsProps = {
	selected?: string;
};

type SettingItem = {
	id: string;
	label: string;
	icon: any;
	component: any;
	props?: any;
};

type SettingSection = {
	title: string;
	id: string;
	items: SettingItem[];
};

export default function Settings(props: SettingsProps) {
	const { state, dispatch } = useStore();
	const currentRealm = createMemo(() => state.realm.current);
	const [selected, setSelected] = createSignal(props.selected || "general");
	const sections = createMemo(() => {
		const SECTIONS: SettingSection[] = [
			{
				title: "App Settings",
				id: "general-group",
				items: [
					{
						id: "general",
						label: "General",
						icon: OrbitIcon,
						component: General,
					},
					{
						id: "appearance",
						label: "Appearance",
						icon: PaletteIcon,
						component: Appearance,
					},
					{
						id: "plugins",
						label: "Plugins",
						icon: HousePlugIcon,
						component: Plugins,
					},
				],
			},
			{
				title: "Controls",
				id: "controls-group",
				items: [
					{
						id: "hotkeys",
						label: "HotKeys",
						icon: KeyboardIcon,
						component: HotKeys,
					},
					{
						id: "modifier",
						label: "Modifier",
						icon: FileSlidersIcon,
						component: Modifier,
					},
				],
			},
			{
				title: "Account",
				id: "identity-group",
				items: state.account.connection.state
					? [
							{
								id: "account:account",
								label: "My Account",
								icon: UserPenIcon,
								component: Account_Profile,
								props: { section: "account" },
							},
							{
								id: "account:relationships",
								label: "Relationships",
								icon: UsersIcon,
								component: Account_Relatinoship,
								props: { section: "relationships" },
							},
							{
								id: "account:security",
								label: "Security",
								icon: UserLockIcon,
								component: Account_Security,
								props: { section: "security" },
							},
							{
								id: "account:danger",
								label: "Danger Zone",
								icon: ShieldUserIcon,
								component: Account_DangerZone,
								props: { section: "danger" },
							},
						]
					: [],
			},
			{
				title: "Advanced",
				id: "advanced-group",
				items: [
					{
						id: "developers",
						label: "Developers",
						icon: FileCodeIcon,
						component: Developers,
					},
				],
			},
			{
				title: "Info",
				id: "info-group",
				items: [
					{
						id: "about",
						label: "About",
						icon: BadgeInfoIcon,
						component: About,
					},
				],
			},
		];
		return SECTIONS;
	});

	return (
		<div
			class="pop-up"
			style={{
				"--animation": "none",
			}}
		>
			<div
				class="up-pop flex h-[calc(90%-calc(var(--spacing)*11))] w-[80%] overflow-hidden"
				style={{
					"--bg-color": "var(--color-secondary)",
					"--p": "0",
				}}
			>
				<div class="flex h-full w-full">
					<div class="bg-secondary-10/20 box-border flex h-full w-[25%] flex-col justify-between gap-2 overflow-hidden px-5 pt-5 pb-10">
						<div class="bg-secondary-10 mb-5 box-border flex shrink-0 overflow-hidden rounded-lg px-3 py-5">
							<HollowIcon class="fill-primary orbit my-auto mr-2 size-12 shrink-0 transition-transform duration-300" />
							<div class="flex min-w-0 flex-1 flex-col">
								<h1 class="my-auto text-xl font-bold text-neutral-950 dark:text-neutral-50">
									{currentRealm().name} Realm
								</h1>
								<div class="flex flex-1">
									<p class="text-secondary-50 max-w-[90%] overflow-hidden text-sm text-ellipsis whitespace-nowrap">
										{currentRealm().id}
									</p>
								</div>
							</div>
							<Button.Root
								class="my-auto ml-auto shrink-0"
								onclick={() => toggleRealm()}
								variant="ghost"
								icon
							>
								<ArrowDownUpIcon class="m-auto" />
							</Button.Root>
						</div>
						<div class="custom-scrollbar flex-1 overflow-y-auto pr-2">
							<For each={sections()}>
								{(section) => (
									<SettingsSection
										title={section.title}
										items={section.items}
										selected={selected}
										setSelected={setSelected}
										isExpanded={section.items.some(
											(i) => i.id === selected(),
										)}
									/>
								)}
							</For>
						</div>
						<button
							class="button secondary mt-4"
							style={{ "--w": "100%" }}
							onclick={() =>
								dispatch({
									domain: "context",
									type: "toggle-settings",
									value: false,
								})
							}
							tabIndex={-1}
						>
							Close
						</button>
					</div>
					<div class="bg-secondary relative box-border h-full flex-1 overflow-hidden overflow-y-scroll px-40 py-30">
						<Presence exitBeforeEnter>
							<For each={sections().flatMap((i) => i.items)}>
								{(panel) => (
									<Show when={selected() === panel.id}>
										<Motion.div
											initial={{
												opacity: 0,
												x: 10,
											}}
											animate={{
												opacity: 1,
												x: 0,
											}}
											exit={{
												opacity: 0,
												x: -10,
											}}
											transition={{
												duration: 0.2,
											}}
											class="h-full"
										>
											<Suspense>
												<DynamicComponent
													item={panel}
												/>
											</Suspense>
										</Motion.div>
									</Show>
								)}
							</For>
						</Presence>
					</div>
				</div>
			</div>
		</div>
	);
}

function DynamicComponent(props: { item: SettingItem }) {
	const Component = props.item.component;
	return <Component {...(props.item.props || {})} />;
}

const SettingsSection: ParentComponent<{
	title: string;
	items: SettingItem[];
	selected: Accessor<string>;
	setSelected: Setter<string>;
	isExpanded?: boolean;
}> = (props) => {
	const [isOpen, setOpen] = createSignal(true);
	const shouldBeOpen = createMemo(
		() => isOpen() || props.items.some((i) => i.id === props.selected()),
	);
	return (
		<div class="flex flex-col gap-1">
			<div
				class="flex cursor-pointer items-center gap-3"
				onclick={() => setOpen((p) => !p)}
			>
				<h1 class="flex py-2 pl-3 text-xs tracking-wider text-neutral-500 transition-colors">
					{props.title}
				</h1>
				<hr class="border-secondary-15 h-0 flex-1" />
				<ChevronDownIcon
					class="text-secondary-30 size-4"
					classList={{ "rotate-90": !shouldBeOpen() }}
				/>
			</div>
			<Show when={shouldBeOpen()}>
				<div class="flex flex-col gap-1 overflow-hidden">
					<For each={props.items}>
						{(item) => (
							<SettingButton
								selected={props.selected}
								setSelected={props.setSelected}
								id={item.id}
							>
								<item.icon size={18} />
								<span class="text-base">{item.label}</span>
							</SettingButton>
						)}
					</For>
				</div>
			</Show>
		</div>
	);
};

const SettingButton: ParentComponent<{
	selected: Accessor<string>;
	setSelected: Setter<string>;
	id: string;
}> = (props) => {
	return (
		<button
			onClick={() => props.setSelected(props.id)}
			class="hover:bg-secondary-10/80 flex h-fit w-full items-center gap-3 rounded-lg px-4 py-2 font-semibold transition-all active:scale-[98%] dark:hover:text-neutral-50"
			classList={{
				"bg-secondary-20/50 text-neutral-950 dark:text-neutral-50  ":
					props.selected() === props.id,
				"text-neutral-600 dark:text-neutral-400  ":
					props.selected() !== props.id,
			}}
		>
			{props.children}
		</button>
	);
};
