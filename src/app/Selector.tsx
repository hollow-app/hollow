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

// Custom hook for realm management
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
                                setRealms((prev) =>
                                        prev.filter((r) => r.id !== id),
                                );
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

// Welcome Screen Component
const WelcomeScreen = (props: { onNext: () => void }) => (
        <Motion
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                class="relative flex h-full w-full items-center justify-center overflow-hidden"
        >
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black" />
                <div class="relative flex w-[600px] flex-col items-center">
                        <div class="relative">
                                <HollowIcon class="h-20 w-20 animate-pulse" />

                                <div class="absolute -inset-4 animate-ping rounded-full bg-white/10" />
                        </div>
                        <h1 class="mt-8 text-4xl font-black tracking-tight text-white">
                                HOLLOW
                        </h1>
                        <p class="mt-2 text-center text-sm tracking-widest text-neutral-400 uppercase">
                                Your Digital Universe
                        </p>
                        <button
                                class="button-empty mt-7 flex items-center gap-3 text-black"
                                style={{ "--bg-color": "#EFEFEF",
                                        "--padding-x": "calc(var(--spacing) * 8)",
                                        "--border-radius": "var(--radius-lg)"
                                 }}
                                onclick={props.onNext}
                        >
                                <RocketIcon class="size-5 hidden" />
                                <span class="relative z-10">BEGIN</span>
                        </button>
                </div>
        </Motion>
);

// Realm List Component
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
                        class="flex h-full w-full flex-col"
                >
                        <div class="flex items-center justify-between border-white/5 px-8 py-6">
                                <h1 class="text-2xl font-black tracking-tight text-white">
                                        REALMS
                                </h1>
                                <button
                                        class="button-secondary flex items-center gap-1 tracking-wide text-white"
                                        style={{ "--bg-color": "#EFEFEF",
                                                "--padding-x": "calc(var(--spacing) * 8)",
                                                "--border-radius": "var(--radius-lg)",
                                                "--padding-y": "10px",
                                         }}
                                        onclick={props.onBack}
                                >
                                        <PlusIcon class="h-4 w-4" />
                                        NEW REALM
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
                                                                class="group relative overflow-hidden rounded-2xl bg-white/5 p-6"
                                                        >
                                                                <div class="relative flex items-center justify-between">
                                                                        <div class="flex items-center gap-6">
                                                                                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                                                                                        <HollowIcon
                                                                                                class="selector-logo size-8"
                                                                                                style={{
                                                                                                        "--color": realm
                                                                                                                .colors
                                                                                                                .primary,
                                                                                                }}
                                                                                        />
                                                                                </div>
                                                                                <div class="flex flex-col gap-1">
                                                                                        <div class="flex items-center gap-3">
                                                                                                <h2 class="text-lg font-medium text-white">
                                                                                                        {
                                                                                                                realm.name
                                                                                                        }
                                                                                                </h2>
                                                                                                <div class="flex gap-1.5">
                                                                                                        <div
                                                                                                                class="h-2.5 w-2.5 rounded-full"
                                                                                                                style={{
                                                                                                                        "background-color":
                                                                                                                                realm
                                                                                                                                        .colors
                                                                                                                                        .primary,
                                                                                                                }}
                                                                                                                title="Primary color"
                                                                                                        />
                                                                                                        <div
                                                                                                                class="h-2.5 w-2.5 rounded-full"
                                                                                                                style={{
                                                                                                                        "background-color":
                                                                                                                                realm
                                                                                                                                        .colors
                                                                                                                                        .secondary,
                                                                                                                }}
                                                                                                                title="Secondary color"
                                                                                                        />
                                                                                                </div>
                                                                                        </div>
                                                                                        <div class="flex items-center gap-4 text-xs tracking-wider text-neutral-400 uppercase">
                                                                                                <div class="flex items-center gap-1">
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
                                                                        <div class="flex items-center gap-3">
                                                                                <button
                                                                                        class="button-control"
                                                                                        style={{
                                                                                                "--color": "white",
                                                                                                "--bg": "white",
                                                                                        }}
                                                                                        onclick={() =>
                                                                                                props.onSelect(
                                                                                                        realm.id,
                                                                                                )
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

// Create Realm Component
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
                        class="flex h-full w-full flex-col"
                >
                        <div class="flex items-center gap-4 border-white/5 px-8 py-6">
                                <button
                                        class="rounded-full p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                                        onclick={props.onBack}
                                >
                                        <ArrowLeftIcon class="h-5 w-5" />
                                </button>
                                <h1 class="text-2xl font-black tracking-tight text-white">
                                        CREATE REALM
                                </h1>
                        </div>

                        <div class="flex flex-1 gap-12 p-8">
                                <div class="flex w-[400px] flex-col gap-8">
                                        <div class="flex flex-col gap-6">
                                                <div class="flex flex-col gap-2">
                                                        <label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
                                                                Realm Name
                                                        </label>
                                                        <input
                                                                placeholder="e.g., saturn"
                                                                value={name()}
                                                                onchange={(
                                                                        e,
                                                                ) => {
                                                                        if (
                                                                                /^[A-Za-z]+$/.test(
                                                                                        e
                                                                                                .currentTarget
                                                                                                .value,
                                                                                )
                                                                        ) {
                                                                                setName(
                                                                                        e
                                                                                                .currentTarget
                                                                                                .value,
                                                                                );
                                                                        }
                                                                }}
                                                                pattern="^[A-Za-z]+$"
                                                                title="e.g., Dark, light, sky..."
                                                                class="rounded-xl bg-white/5 px-4 py-3 text-white placeholder-neutral-500 focus:ring-2 focus:ring-white/20 focus:outline-none"
                                                        />
                                                </div>
                                                <div class="flex flex-col gap-2">
                                                        <label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
                                                                Primary Color
                                                        </label>
                                                        <ColorPick
                                                                color={primary()}
                                                                setColor={
                                                                        setPrimary
                                                                }
                                                                borderColor={
                                                                        "var(--color-neutral-800)"
                                                                }
                                                        />
                                                </div>
                                                <div class="flex flex-col gap-2">
                                                        <label class="text-sm font-medium tracking-wider text-neutral-400 uppercase">
                                                                Secondary Color
                                                        </label>
                                                        <ColorPick
                                                                color={secondary()}
                                                                setColor={
                                                                        setSecondary
                                                                }
                                                                borderColor={
                                                                        "var(--color-neutral-800)"
                                                                }
                                                        />
                                                </div>
                                        </div>
                                </div>

                                <div class="flex flex-1 items-center justify-center">
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
                                                                                {name() ||
                                                                                        "NEW REALM"}
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
                                                        Preview of your realm's
                                                        appearance
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <div class="flex justify-end border-t border-white/5 p-6">
                                <button
                                       class="button-secondary flex items-center gap-1 tracking-wide text-white"
                                       style={{ "--bg-color": "#EFEFEF",
                                               "--padding-x": "calc(var(--spacing) * 8)",
                                               "--border-radius": "var(--radius-lg)",
                                               "--padding-y": "10px",
                                        }}
                                        onclick={handleSubmit}
                                >
                                        CREATE REALM
                                </button>
                        </div>
                </Motion>
        );
};

export default function Selector({ onSelect }: SelectorProps) {
        const [level, setLevel] = createSignal(
                window.realmManager.realms.length === 0 ? 0 : 1,
        );
        const [realms, setRealms] = createSignal<Realm[]>(
                window.realmManager.realms,
        );

        return (
                <div class="flex h-full w-full items-center justify-center overflow-hidden bg-black">
                        <div class="absolute top-2 right-2 z-10"><WindowControl expanded/></div>
                        <div class="h-[600px] w-[800px] rounded-2xl bg-neutral-950 shadow-2xl shadow-black/40">
                                <Presence exitBeforeEnter>
                                        <Show when={level() === 0}>
                                                <WelcomeScreen
                                                        onNext={() =>
                                                                setLevel(2)
                                                        }
                                                />
                                        </Show>

                                        <Show when={level() === 1}>
                                                <RealmList
                                                        onBack={() =>
                                                                setLevel(2)
                                                        }
                                                        onSelect={(id) =>
                                                                window.realmManager.enterRealm(
                                                                        id,
                                                                )
                                                        }
                                                        realms={realms}
                                                        setRealms={setRealms}
                                                />
                                        </Show>

                                        <Show when={level() === 2}>
                                                <CreateRealm
                                                        onBack={() =>
                                                                setLevel(1)
                                                        }
                                                        onSuccess={() =>
                                                                setLevel(1)
                                                        }
                                                />
                                        </Show>
                                </Presence>
                        </div>
                </div>
        );
}
