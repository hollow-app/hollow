import ColorPick from "@components/ColorPick";
import NumberInput from "@components/NumberInput";
import TagEditor from "@components/TagEditor";
import { useBackground } from "@hooks/useBackground";
import { useColor } from "@hooks/useColor";
import useGrid from "@hooks/useGrid";
import {
	createMemo,
	createResource,
	createSignal,
	For,
	Show,
	Suspense,
} from "solid-js";
import { TagType } from "@type/hollow";
import useTags from "@hooks/useTags";
import { readableColor } from "polished";
import Slider from "@components/Slider";
import setStyle from "@hooks/setStyle";
import { RealmManager } from "@managers/RealmManager";
import { hollow } from "hollow";
import { CodeThemeManager } from "@managers/CodeThemeManager";
import { MarkdownManager } from "@managers/MarkdownManager";
import Loading from "@components/Loading";
import { SettingsManager } from "@managers/SettingsManager";
import Dropdown from "@components/Dropdown";

export default function Appearance() {
	const settingsManager = SettingsManager.getSelf();
	return (
		<div class="h-full p-10">
			<GridSettings settingsManager={settingsManager} />
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
			<ColorSettings />
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
			<BackgroundSettings settingsManager={settingsManager} />
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
function GridSettings({ settingsManager }: CommonSettings) {
	const columns = createMemo(() => settingsManager.getConfig("columns"));
	const offColumns = createMemo(() =>
		settingsManager.getConfig("offcolumns"),
	);
	const rows = createMemo(() => settingsManager.getConfig("rows"));
	const offRows = createMemo(() => settingsManager.getConfig("offrows"));
	const staticGridLines = createMemo(() =>
		settingsManager.getConfig("static-grid-lines"),
	);

	const setColumns = (n: number) => {
		useGrid([{ name: "columns", value: n }]);
		settingsManager.setConfig("columns", n);
	};
	const setMoreColumns = (n: number) => {
		useGrid([{ name: "offcolumns", value: n }]);
		settingsManager.setConfig("offcolumns", n);
	};
	const setRows = (n: number) => {
		useGrid([{ name: "rows", value: n }]);
		settingsManager.setConfig("rows", n);
	};
	const setMoreRows = (n: number) => {
		useGrid([{ name: "offrows", value: n }]);
		settingsManager.setConfig("offrows", n);
	};

	return (
		<>
			<h1 class="text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				Grid
			</h1>
			<div class="w-full pb-4">
				<div class="flex w-full flex-col gap-5 p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
								Columns
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								Number of columns that fit within the screen
								width.
							</p>
						</div>
						<div class="w-70 max-w-[50%]">
							<NumberInput
								value={columns}
								setValue={setColumns}
							/>
						</div>
					</div>
					<div class="bg-secondary-10/40 mx-auto flex w-full items-center justify-between rounded-lg p-2">
						<h2 class="text-sm text-neutral-600 dark:text-neutral-400">
							Off screen columns
						</h2>
						<div class="w-70 max-w-[50%]">
							<NumberInput
								value={offColumns}
								setValue={setMoreColumns}
							/>
						</div>
					</div>
					<hr class="bg-secondary-10 h-px w-full border-0" />
					<div class="flex justify-between">
						<div>
							<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
								Rows
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								Number of rowss that fit within the screen
								height.
							</p>
						</div>
						<div class="w-70 max-w-[50%]">
							<NumberInput value={rows} setValue={setRows} />
						</div>
					</div>
					<div class="bg-secondary-10/40 mx-auto flex w-full items-center justify-between rounded-lg p-2">
						<h2 class="text-sm text-neutral-600 dark:text-neutral-400">
							Off screen rows
						</h2>
						<div class="w-70 max-w-[50%]">
							<NumberInput
								value={offRows}
								setValue={setMoreRows}
							/>
						</div>
					</div>
					<hr class="bg-secondary-10 h-px w-full border-0" />
					<div class="flex items-center justify-between">
						<h1 class="text-sm tracking-widest uppercase">
							Static Grid Lines
						</h1>

						<div class="toggle-switch">
							<input
								class="toggle-input"
								type="checkbox"
								id="static-grid-lines-toggle"
								checked={staticGridLines()}
								onchange={(e) => {
									const check = e.currentTarget.checked;
									settingsManager.setConfig(
										"static-grid-lines",
										check,
									);
									setStyle([
										{
											name: "--static-grid-lines",
											value: check
												? "var(--secondary-color-15)"
												: "transparent",
										},
									]);
								}}
							/>
							<label
								class="toggle-label"
								for="static-grid-lines-toggle"
							></label>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function ColorSettings() {
	const realm = createMemo(() => RealmManager.getSelf().currentRealmId);
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
							color={primaryColor}
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
							color={secondaryColor}
							setColor={setSecondaryColor}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

function BackgroundSettings({ settingsManager }: CommonSettings) {
	const backgroundImage = createMemo(() =>
		settingsManager.getConfig("background-image"),
	);
	const backgroundOpacity = createMemo(() =>
		settingsManager.getConfig("background-opacity"),
	);
	const [background, setBackground] = createSignal({
		opacity: backgroundOpacity(),
	});

	const selectBg = () => {
		hollow.events.emit("show-vault", { onSelect: setBackgroundImg });
	};
	const setBackgroundImg = (path: string) => {
		settingsManager.setConfig("background-image", path);
		useBackground({ path: `url(${path})` });
	};
	const setBackgroundOpacity = (opacity: number) => {
		settingsManager.setConfig("background-opacity", opacity / 100);
		useBackground({ opacity: `${opacity / 100}` });
	};

	return (
		<>
			<h1 class="pt-8 text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				Background
			</h1>
			<div class="w-full pb-4">
				<div class="flex flex-col gap-5 p-5">
					<div class="flex justify-between">
						<div>
							<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
								Background Image
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								The background image of the canvas.
							</p>
						</div>
						<button class="button-secondary" onclick={selectBg}>
							Select
						</button>
					</div>
					<div class="flex justify-between">
						<div>
							<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
								Opacity
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								Adjust the opacity of the image along the
								secondary color{" "}
							</p>
						</div>
						<div class="flex gap-3">
							<Slider
								value={backgroundOpacity() * 100}
								setValue={(v) => {
									setBackground((prev) => ({
										...prev,
										opacity: v,
									}));
									setBackgroundOpacity(v);
								}}
							/>
						</div>
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
		MarkdownManager.getSelf().renderMarkdown(
			exampleCode(),
			"code-theme-example",
		),
	);
	const [codeTheme, setCodeTheme] = createSignal(
		settingsManager.getConfig("code-theme"),
	);

	const useCodeTheme = async (v: string) => {
		settingsManager.setConfig("code-theme", v);
		setCodeTheme(v);
		await CodeThemeManager.getSelf().loadTheme(v);
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
						value={codeTheme}
						options={() => [
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

	const [newTag, setNewTag] = createSignal<TagType>({
		name: "",
		foreground: "",
		background: "#151515",
	});
	const submit = () => {
		const { name, background } = newTag();
		if (
			name !== "" &&
			!tags()
				.map((i) => i.name)
				.includes(`${name}`)
		) {
			const newTags = [
				...tags(),
				{
					name,
					background,
					foreground: readableColor(background),
				},
			];
			setTags(newTags);
			settingsManager.setConfig("custom-tags", newTags);
			useTags(newTags);
			setNewTag({ name: "", background: "#151515", foreground: "" });
		}
	};
	const toTags = (v: TagType[] | ((prev: TagType[]) => TagType[])) => {
		const newTags = typeof v === "function" ? v(tags()) : v;
		settingsManager.setConfig("custom-tags", newTags);
		setTags(newTags);
		useTags(newTags);
	};

	return (
		<div class="w-full py-4">
			<h1 class="pt-8 text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				Tags
			</h1>
			<p class="pt-2 text-sm text-neutral-600 dark:text-neutral-400">
				Custom tags that will be used by tools.{" "}
			</p>
			<div class="bg-secondary-10/40 flex h-fit w-full items-center justify-between rounded p-3">
				<h3 class="font-bold text-neutral-950 dark:text-neutral-50">
					New Tag
				</h3>
				<div class="flex items-center gap-2">
					<input
						class="input"
						type="tag-name"
						name="tagName"
						placeholder="Name"
						style={{
							"--bg-color": "var(--color-secondary-10)",
							"--bg-color-f": "var(--color-secondary-15)",
						}}
						oninput={(e) =>
							setNewTag((prev) => ({
								...prev,
								name: e.currentTarget.value,
							}))
						}
					/>
					<ColorPick
						color={() => newTag().background}
						setColor={(c) =>
							setNewTag((prev) => ({ ...prev, background: c }))
						}
					/>
				</div>
				<button class="button-secondary" onclick={submit}>
					Add
				</button>
			</div>
			<div class="flex flex-wrap justify-center gap-3 pt-5 pb-60">
				<For each={tags()}>
					{(tag) => <TagEditor tag={tag} setTags={toTags} />}
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
