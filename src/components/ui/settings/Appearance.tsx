import ColorPick from "@components/dynamic/ColorPick";
import NumberInput from "@components/dynamic/NumberInput";
import { useColor } from "@hooks/useColor";
import {
	createMemo,
	createResource,
	createSignal,
	For,
	onCleanup,
	Show,
	Suspense,
} from "solid-js";
import { FormType } from "@type/hollow";
import useTags from "@hooks/useTags";
import { readableColor } from "polished";
import { manager } from "@managers/index";
import { hollow } from "hollow";
import Loading from "@components/Loading";
import Dropdown from "@components/dynamic/Dropdown";
import { CircleFadingPlusIcon } from "lucide-solid";
import Tag from "@components/Tag";
import useGrid from "@hooks/useGrid";
import { GridStackOptions } from "gridstack";
import { Accessor } from "solid-js";
import { Setter } from "solid-js";
import { SettingsManager } from "@managers/SettingsManager";

type Props = CanvasProps;
export default function Appearance(props: Props) {
	const settingsManager = manager.settings;
	return (
		<div class="h-full p-10">
			<CanvasSettings {...props} />
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
			<ColorSettings />
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
			<CodeThemeSettings settingsManager={settingsManager} />
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
			<TagsEditor settingsManager={settingsManager} />
		</div>
	);
}
type CommonSettings = {
	settingsManager: SettingsManager;
};

interface CanvasProps {
	canvasConfigs: Accessor<GridStackOptions>;
	setCanvasConfigs: Setter<GridStackOptions>;
}
function CanvasSettings(props: CanvasProps) {
	const [gridGap, setGridGap] = createSignal(
		manager.settings.getConfig("grid-gap"),
	);
	const [gridSize, setGridSize] = createSignal(props.canvasConfigs().column);
	const cellHeight = createMemo(() => {
		return (window.innerHeight - 16 + gridGap()) / (gridSize() as number);
	});
	const setGapBetweenCards = (v: number) => {
		setGridGap(v);
		useGrid([{ name: "--grid-gap", value: v }]);
		props.setCanvasConfigs((prev) => ({
			...prev,
			cellHeight: cellHeight(),
		}));
	};

	const setGrid_size = (v: number) => {
		setGridSize(v);
		props.setCanvasConfigs((prev) => ({
			...prev,
			column: v,
			cellHeight: cellHeight(),
		}));
	};

	onCleanup(() => {
		manager.settings.setConfigs({
			"grid-gap": gridGap(),
			"grid-size": Number(gridSize()),
		});
	});

	return (
		<>
			<h1 class="pt-8 text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				Canvas
			</h1>
			<div class="w-full pb-4">
				<div class="flex flex-col gap-5 p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
								Grid Size
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								Number of columns inside the canvas.
							</p>
						</div>
						<div class="w-50">
							<NumberInput
								value={
									typeof gridSize() === "string"
										? 12
										: Number(gridSize())
								}
								setValue={setGrid_size}
								direct
							/>
						</div>
					</div>
					<div class="flex justify-between">
						<div>
							<h2 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
								Grid Gap
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								Change the gap between cards
							</p>
						</div>
						<div class="w-50">
							<NumberInput
								value={gridGap()}
								setValue={setGapBetweenCards}
								direct
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function ColorSettings() {
	const realm = createMemo(() => manager.realm.currentRealmId);
	const primaryColor = createMemo(
		() =>
			JSON.parse(localStorage.getItem(`${realm()}-color-primary`))
				.savedColor,
	);
	const secondaryColor = createMemo(
		() =>
			JSON.parse(localStorage.getItem(`${realm()}-color-secondary`))
				.savedColor,
	);

	const setPrimaryColor = (c: string) => {
		useColor({ name: "primary", color: c });
	};
	const setSecondaryColor = (c: string) => {
		useColor({ name: "secondary", color: c });
	};

	return (
		<>
			<h1 class="pt-8 text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				Colors
			</h1>
			<div class="w-full pb-4">
				<div class="flex flex-col gap-5 p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
								Primary Color
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								Primary color used for highlighting important
								elements in the app.
							</p>
						</div>
						<ColorPick
							color={primaryColor()}
							setColor={setPrimaryColor}
						/>
					</div>
					<hr class="bg-secondary-10 h-px w-full border-0" />
					<div class="flex justify-between">
						<div>
							<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
								Secondary Color
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								Secondary color used for the background theme.
							</p>
						</div>
						<ColorPick
							color={secondaryColor()}
							setColor={setSecondaryColor}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

const exampleCode = () => `
\`\`\`js
function greet(name) {
  console.log(\`Hello, ${name}!\`);
}
greet("Theme Tester");
\`\`\`
`;

function CodeThemeSettings({ settingsManager }: CommonSettings) {
	const [md] = createResource(exampleCode, () =>
		manager.markdown.renderMarkdown(exampleCode(), "code-theme-example"),
	);
	const [codeTheme, setCodeTheme] = createSignal(
		settingsManager.getConfig("code-theme"),
	);

	const useCodeTheme = async (v: string) => {
		settingsManager.setConfig("code-theme", v);
		setCodeTheme(v);
		await manager.codeTheme.loadTheme(v);
	};

	return (
		<>
			<div class="flex items-center justify-between">
				<div class="py-8">
					<h1 class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
						Code Theme
					</h1>
					<p class="pl-5 text-xs text-neutral-500">
						All themes can be easily previewed on{" "}
						<a
							href={"https://highlightjs.org/examples"}
							target="_blank"
						>
							Highlight.js
						</a>
						.
					</p>
				</div>
				<div class="flex h-40 items-center">
					<Show when={codeTheme()} fallback={<Loading />}>
						<Suspense>
							<div class="markdown-preview" innerHTML={md()} />
						</Suspense>
					</Show>
				</div>
				<div class="w-70">
					<Dropdown
						value={codeTheme()}
						options={[
							{
								items: codeThemes,
							},
						]}
						onSelect={useCodeTheme}
					/>
				</div>
			</div>
		</>
	);
}

function TagsEditor({ settingsManager }: CommonSettings) {
	const [tags, setTags] = createSignal(
		settingsManager.getConfig("custom-tags"),
	);

	const submit = (
		data: { name: string; background: string },
		prev?: { name: string; background: string },
	) => {
		const { name, background } = data;
		const updateNewName = prev && !tags().some((i) => i.name === prev.name);
		const newTag = {
			name,
			background,
			foreground: readableColor(background),
		};
		if (name !== "") {
			const newTags = updateNewName
				? [newTag, ...tags().filter((i) => i.name !== prev!.name)]
				: prev
					? tags().map((t) => (t.name === prev.name ? newTag : t))
					: [...tags(), newTag];
			setTags(newTags);
			settingsManager.setConfig("custom-tags", newTags);
			hollow.events.emit("character-add-achievement", "🏷️ Classifier");
			useTags(newTags);
		}
	};
	const onNewTag = (data?: { name: string; background: string }) => {
		const update = !!data;
		const form: FormType = {
			id: (update ? "update" : "new") + "-tag-form",
			title: (update ? "Update" : "New") + " Tag",
			update,
			options: [
				{
					key: "name",
					type: "text",
					label: "Label",
					value: data?.name,
					attributes: {
						placeholder: "tag label",
					},
					inline: true,
				},
				{
					key: "background",
					row: true,
					label: "Color",
					value: data?.background,
					type: "color",
					inline: true,
				},
			],
			submit: (new_data) =>
				update ? submit(new_data, data) : submit(new_data),
		};
		hollow.events.emit("form", form);
	};

	return (
		<div class="w-full py-4">
			<div class="flex justify-between pt-8">
				<div>
					<h1 class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
						Tags
					</h1>
					<p class="mt-1 mb-5 text-xs text-neutral-500">
						{" "}
						Custom tags that will be used by tools.{" "}
					</p>
				</div>
				<button
					class="button secondary"
					style={{ "--padding-y": "calc(var(--spacing) * 3)" }}
					onclick={() => onNewTag()}
				>
					<CircleFadingPlusIcon class="size-5" />
				</button>
			</div>
			<div class="flex flex-wrap justify-center gap-3 pt-5 pb-60 text-lg">
				<For each={tags()}>
					{(tag) => (
						<button
							class="flex transition-transform outline-none hover:rotate-12 active:scale-120"
							onclick={() =>
								onNewTag({
									name: tag.name,
									background: tag.background,
								})
							}
						>
							<Tag tag={tag.name} />
						</button>
					)}
				</For>
			</div>
		</div>
	);
}

const codeThemes: string[] = [
	"1c-light",
	"a11y-dark",
	"a11y-light",
	"agate",
	"androidstudio",
	"an-old-hope",
	"arduino-light",
	"arta",
	"ascetic",
	"atom-one-dark",
	"atom-one-dark-reasonable",
	"atom-one-light",
	"brown-paper",
	"codepen-embed",
	"color-brewer",
	"cybertopia-cherry",
	"cybertopia-dimmer",
	"cybertopia-icecap",
	"cybertopia-saturated",
	"dark",
	"default",
	"devibeans",
	"docco",
	"far",
	"felipec",
	"foundation",
	"github-dark-dimmed",
	"github-dark",
	"github",
	"gml",
	"googlecode",
	"gradient-dark",
	"gradient-light",
	"neutralscale",
	"hybrid",
	"idea",
	"intellij-light",
	"ir-black",
	"isbl-editor-dark",
	"isbl-editor-light",
	"kimbie-dark",
	"kimbie-light",
	"lightfair",
	"lioshi",
	"magula",
	"mono-blue",
	"monokai",
	"monokai-sublime",
	"night-owl",
	"nnfx-dark",
	"nnfx-light",
	"nord",
	"obsidian",
	"panda-syntax-dark",
	"panda-syntax-light",
	"paraiso-dark",
	"paraiso-light",
	"pojoaque",
	"purebasic",
	"qtcreator-dark",
	"qtcreator-light",
	"rainbow",
	"rose-pine-dawn",
	"rose-pine",
	"rose-pine-moon",
	"routeros",
	"school-book",
	"shades-of-purple",
	"srcery",
	"stackoverflow-dark",
	"stackoverflow-light",
	"sunburst",
	"tokyo-night-dark",
	"tokyo-night-light",
	"tomorrow-night-blue",
	"tomorrow-night-bright",
	"vs2015",
	"vs",
	"xcode",
	"xt256",
];
