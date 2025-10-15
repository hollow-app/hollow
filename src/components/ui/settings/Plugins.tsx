import { RustManager } from "@managers/RustManager";
import {
	ChevronLeftIcon,
	ShieldAlertIcon,
	ShieldCheckIcon,
} from "lucide-solid";
import { marked } from "marked";
import {
	createEffect,
	createSignal,
	For,
	Setter,
	Show,
	Suspense,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";

type PluginsProps = {};
interface ToolType {
	name: string;
	desc: string;
	version: string;
	repo: string;
	author: string;
	verified: boolean;
	verificationDate: string;
	installed?: boolean;
}

export default function Plugins({}: PluginsProps) {
	const [unverified, checkUnverified] = createSignal(false);
	const [selectedTool, setSelectedTool] = createSignal(null);
	const [selectedMD, setSelectedMD] = createSignal(null);
	const [tools, setTools] = createSignal([]);

	const enableUnverified = (
		e: Event & { currentTarget: HTMLInputElement },
	) => {
		if (!unverified()) {
			e.preventDefault();
			window.hollowManager.emit("confirm", {
				type: "warning",
				message:
					"Installing unverified plugins may pose security risks.\nOnly install plugins that you trust and are sure are safe.",

				decision: () => {
					checkUnverified(true);
				},
			});
		} else {
			checkUnverified(false);
		}
	};
	createEffect(async () => {
		try {
			const text: string = await RustManager.getSelf().fetch({
				url: "https://raw.githubusercontent.com/hollow-app/hollow-registry/refs/heads/main/plugins.json",
				options: undefined,
				responseType: "text",
			});
			const jsonData: ToolType[] = JSON.parse(text);
			setTools(jsonData);
		} catch (error) {
			console.error("Error fetching file:", error);
		}
	});

	// 0 : not installed, 1: installed, 2 changing
	// TODO test update
	const installPlugin = async () => {
		const isInstalled = selectedTool().installed;
		setSelectedTool((prev) => ({ ...prev, installed: null }));
		if (isInstalled) {
			const request = await window.toolManager.uninstallTool(
				selectedTool().name,
			);
			request &&
				setSelectedTool((prev) => ({
					...prev,
					installed: false,
				}));
		} else {
			const request = await window.toolManager.installTool(
				selectedTool().name,
				selectedTool().repo,
			);
			request &&
				setSelectedTool((prev) => ({
					...prev,
					installed: true,
				}));
		}
	};

	return (
		<Presence exitBeforeEnter>
			<Show when={!selectedTool()}>
				<Motion
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
					class="flex flex-col p-10 text-neutral-950 dark:text-neutral-100"
				>
					<div class="flex justify-between">
						<h1 class="text-4xl font-bold">Plugins</h1>
						<div class="flex items-center">
							<p>Enable Unverified Plugins</p>
							<div class="toggle-switch">
								<input
									class="toggle-input"
									id="enable-unverified-toggle"
									type="checkbox"
									checked={unverified()}
									onclick={enableUnverified}
								/>
								<label
									class="toggle-label"
									for="enable-unverified-toggle"
								></label>
							</div>
						</div>
					</div>
					<input
						class="input my-5"
						style={{
							"--bg-color": "var(--secondary-color-10)",
							"--bg-color-f": "var(--secondary-color-15)",
						}}
						placeholder="Search"
					/>
					<div class="grid flex-1 grid-cols-[1fr_1fr_1fr] overflow-hidden overflow-y-scroll">
						<For
							each={
								unverified()
									? tools()
									: tools().filter((i) => i.verified)
							}
						>
							{(tool) => (
								<ToolButton
									tool={tool}
									setSelectedTool={setSelectedTool}
									setSelectedMD={setSelectedMD}
								/>
							)}
						</For>
					</div>
				</Motion>
			</Show>
			<Show when={selectedTool()}>
				<Motion
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
					class="flex h-full flex-col p-10 text-neutral-950 dark:text-neutral-100"
				>
					<div class="mb-5 flex justify-between">
						<div class="flex">
							<button
								class="button-secondary my-auto mr-5 h-full"
								onclick={() => setSelectedTool(null)}
							>
								<ChevronLeftIcon class="m-auto" />
							</button>

							<h1 class="text-5xl font-bold">
								{selectedTool().name}
							</h1>
						</div>
						<div class="bg-secondary-10 rounded p-3">
							{selectedTool().verified ? (
								<ShieldCheckIcon class="text-green-600" />
							) : (
								<ShieldAlertIcon class="text-yellow-600" />
							)}
						</div>
					</div>
					<div class="flex h-fit w-full justify-between">
						<div class="grid w-fit grid-cols-[auto_auto] font-mono">
							<p class="text-secondary-40">Author</p>
							<p>{selectedTool().author}</p>
							<p class="text-secondary-40">Version</p>
							<p>{selectedTool().version}</p>
							<p class="text-secondary-40 pr-5">Description</p>
							<p>{selectedTool().desc}</p>
						</div>
					</div>
					<div class="flex items-end justify-between">
						<a
							class="text-secondary-50 hover:text-secondary-90 cursor-pointer text-sm underline"
							target="_blank"
							href={`https://github.com/${selectedTool().repo}`}
						>
							Source Code
						</a>

						<button class="button-primary" onclick={installPlugin}>
							{(() => {
								const installed = selectedTool().installed;
								return installed
									? "Uninstall"
									: installed === null
										? "In-Process"
										: "Install";
							})()}
						</button>
					</div>
					<div class="bg-secondary-10 mt-5 box-border w-full flex-1 overflow-hidden overflow-y-scroll rounded-xl p-5">
						<Suspense
							fallback={
								<div class="flex h-full w-full items-center justify-center">
									<div class="chaotic-orbit" />
								</div>
							}
						>
							<div
								class="markdown-preview"
								innerHTML={selectedMD()}
							/>
						</Suspense>
					</div>
				</Motion>
			</Show>
		</Presence>
	);
}

type ToolButtonProps = {
	tool: ToolType;
	setSelectedTool: Setter<ToolType>;
	setSelectedMD: Setter<string>;
};
function ToolButton({ tool, setSelectedTool, setSelectedMD }: ToolButtonProps) {
	const [loading, setLoading] = createSignal(false);

	const onClick = async () => {
		setLoading(true);
		try {
			const readme = await RustManager.getSelf().fetch({
				url: `https://api.github.com/repos/${tool.repo}/readme`,
				options: {
					headers: {
						Accept: "application/vnd.github.v3+json",
					},
				},
				responseType: "json",
			});
			const fileContent = new TextDecoder("utf-8").decode(
				Uint8Array.from(atob(readme.content), (c) => c.charCodeAt(0)),
			);
			if (tool.verified) {
				const rep = await RustManager.getSelf().fetch({
					url: `https://api.github.com/repos/${tool.repo}`,
					options: {
						headers: {
							Accept: "application/vnd.github.v3+json",
						},
					},
				});
				tool.verified = tool.verificationDate === rep.updated_at;
			}
			const isInstalled = window.toolManager
				.getHand()
				.some((i) => i.name === tool.name.toLowerCase());
			setSelectedTool({
				...tool,
				installed: isInstalled,
			});
			setSelectedMD(await marked(fileContent));
		} catch (error) {
			console.log(error);
		}

		setLoading(false);
	};

	return (
		<div
			class="bg-secondary-10/40 border-secondary-15 hover:bg-secondary-10 relative m-2 cursor-pointer rounded border-1 p-5 transition-all active:scale-95"
			onclick={onClick}
		>
			<div classList={{ "opacity-0": loading() }}>
				<h1 class="text-xl font-bold">{tool.name}</h1>
				<p class="text-secondary-40 line-clamp-1">{tool.desc}</p>
				<div class="text-secondary-40 mt-5 flex justify-between font-mono">
					<h2>by {tool.author}</h2>
					<p>{tool.version}</p>
				</div>
				<div class="flex justify-between">
					<button></button>
				</div>
			</div>
			<Show when={loading()}>
				<div class="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center">
					<div class="chaotic-orbit" />
				</div>
			</Show>
		</div>
	);
}
