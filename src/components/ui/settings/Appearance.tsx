import ColorPick from "@components/ColorPick";
import NumberInput from "@components/NumberInput";
import TagEditor from "@components/TagEditor";
import { useBackground } from "@hooks/useBackground";
import { useColor } from "@hooks/useColor";
import useCodeTheme from "@hooks/useCodeTheme";
import useGrid from "@hooks/useGrid";
import { createMemo, createSignal, For } from "solid-js";
import { TagType } from "@type/TagType";
import useTags from "@hooks/useTags";
import DropDown from "@components/DropDown";
import { readableColor } from "polished";
import Slider from "@components/Slider";
import setStyle from "@hooks/setStyle";
import ImportFile from "@components/ImportFile";

type AppearanceProps = {};

export default function Appearance({}: AppearanceProps) {
	const realm = createMemo(() => window.realmManager.currentRealmId);
	const grid = createMemo(() =>
		JSON.parse(localStorage.getItem(`${realm()}-canvas`)),
	);
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
	const [background, setBackground] = createSignal(
		(() => {
			const data = JSON.parse(
				localStorage.getItem(`${realm()}-canvas-bg`),
			);
			return {
				...data,
				opacity: Math.round(data.opacity * 100),
			};
		})(),
	);
	const [tags, setTags] = createSignal<TagType[]>(
		JSON.parse(localStorage.getItem(`${realm()}-tags`)),
	);
	const codeTheme = createMemo(() =>
		localStorage.getItem(`${realm()}-code-theme`),
	);
	const setColumns = (n: number) => {
		useGrid([{ name: "columns", value: n }]);
	};
	const setMoreColumns = (n: number) => {
		useGrid([{ name: "offcolumns", value: n }]);
	};
	const setRows = (n: number) => {
		useGrid([{ name: "rows", value: n }]);
	};
	const setMoreRows = (n: number) => {
		useGrid([{ name: "offrows", value: n }]);
	};
	const setPrimaryColor = (c: string) => {
		useColor({ name: "primary", color: c });
	};
	const setSecondaryColor = (c: string) => {
		useColor({ name: "secondary", color: c });
	};
	const setBackgroundImg = (img: string) => {
		useBackground({ data: `url(${img})`, name: "background" });
	};
	const setBackgroundOpacity = () => {
		useBackground({ opacity: `${background().opacity / 100}` });
	};
	const onSubmitTag = (e: SubmitEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const values = Object.fromEntries(formData.entries());
		const { tagName, colorPicked } = values;
		if (
			tagName !== "" &&
			!tags()
				.map((i) => i.name)
				.includes(`${tagName}`)
		) {
			toTags((prev) => [
				...prev,
				{
					name: `${tagName}`,
					background: `${colorPicked}`,
					foreground: readableColor(`${colorPicked}`),
				},
			]);
		}
	};
	const toTags = (v: TagType[] | ((prev: TagType[]) => TagType[])) => {
		setTags(typeof v === "function" ? v : () => v);
		useTags(tags());
	};
	const setCodeTheme = (v: string) => {
		useCodeTheme(v);
	};
	return (
		<div class="h-full p-10">
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
								value={grid().columns}
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
								value={grid().offcolumns}
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
							<NumberInput
								value={grid().rows}
								setValue={setRows}
							/>
						</div>
					</div>
					<div class="bg-secondary-10/40 mx-auto flex w-full items-center justify-between rounded-lg p-2">
						<h2 class="text-sm text-neutral-600 dark:text-neutral-400">
							Off screen rows
						</h2>
						<div class="w-70 max-w-[50%]">
							<NumberInput
								value={grid().offrows}
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
								checked={JSON.parse(
									localStorage.getItem(
										`${realm()}-static-grid-lines`,
									) ?? "false",
								)}
								onchange={(e) => {
									const check = e.currentTarget.checked;
									setStyle([
										{
											name: "--static-grid-lines",
											value: check
												? "var(--secondary-color-15)"
												: "transparent",
										},
									]);
									localStorage.setItem(
										`${realm()}-static-grid-lines`,
										`${check}`,
									);
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
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
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
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
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
						<ImportFile
							accepts={"image/*"}
							onChange={setBackgroundImg}
							xfile={background().name}
						/>
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
								value={Number(background().opacity)}
								setValue={(v) => {
									setBackground((prev) => ({
										...prev,
										opacity: v,
									}));
									setBackgroundOpacity();
								}}
							/>
						</div>
					</div>
				</div>
			</div>
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
			<div class="flex items-center justify-between">
				<div class="">
					<h1 class="py-8 text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
						Code Theme
					</h1>
					<p>
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
				<DropDown
					value={codeTheme()}
					items={codeThemes}
					onSelect={setCodeTheme}
				/>
			</div>
			<hr class="bg-secondary-10 mx-auto my-4 h-px border-0" />
			<h1 class="pt-8 text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				Tags
			</h1>
			<p class="pt-2 text-sm text-neutral-600 dark:text-neutral-400">
				Custom tags that will be used by tools.{" "}
			</p>

			<div class="w-full py-4">
				<form
					class="bg-secondary-10/40 flex h-fit w-full items-center justify-between rounded p-3"
					onsubmit={onSubmitTag}
				>
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
						/>
						<ColorPick
							color={() => "#151515"}
							setColor={() => {}}
						/>
					</div>
					<button class="button-secondary" type="submit">
						Add
					</button>
				</form>
				<div class="flex flex-wrap justify-center gap-3 pt-5 pb-60">
					<For each={tags()}>
						{(tag) => <TagEditor tag={tag} setTags={toTags} />}
					</For>
				</div>
			</div>
		</div>
	);
}

const codeThemes: string[] = [
	"1c-light",
	"1c-light.min",
	"a11y-dark",
	"a11y-dark.min",
	"a11y-light",
	"a11y-light.min",
	"agate",
	"agate.min",
	"androidstudio",
	"androidstudio.min",
	"an-old-hope",
	"an-old-hope.min",
	"arduino-light",
	"arduino-light.min",
	"arta",
	"arta.min",
	"ascetic",
	"ascetic.min",
	"atom-one-dark",
	"atom-one-dark.min",
	"atom-one-dark-reasonable",
	"atom-one-dark-reasonable.min",
	"atom-one-light",
	"atom-one-light.min",
	"brown-paper",
	"brown-paper.min",
	"codepen-embed",
	"codepen-embed.min",
	"color-brewer",
	"color-brewer.min",
	"cybertopia-cherry",
	"cybertopia-cherry.min",
	"cybertopia-dimmer",
	"cybertopia-dimmer.min",
	"cybertopia-icecap",
	"cybertopia-icecap.min",
	"cybertopia-saturated",
	"cybertopia-saturated.min",
	"dark",
	"dark.min",
	"default",
	"default.min",
	"devibeans",
	"devibeans.min",
	"docco",
	"docco.min",
	"far",
	"far.min",
	"felipec",
	"felipec.min",
	"foundation",
	"foundation.min",
	"github",
	"github-dark",
	"github-dark-dimmed",
	"github-dark-dimmed.min",
	"github-dark.min",
	"github.min",
	"gml",
	"gml.min",
	"googlecode",
	"googlecode.min",
	"gradient-dark",
	"gradient-dark.min",
	"gradient-light",
	"gradient-light.min",
	"neutralscale",
	"neutralscale.min",
	"hybrid",
	"hybrid.min",
	"idea",
	"idea.min",
	"intellij-light",
	"intellij-light.min",
	"ir-black",
	"ir-black.min",
	"isbl-editor-dark",
	"isbl-editor-dark.min",
	"isbl-editor-light",
	"isbl-editor-light.min",
	"kimbie-dark",
	"kimbie-dark.min",
	"kimbie-light",
	"kimbie-light.min",
	"lightfair",
	"lightfair.min",
	"lioshi",
	"lioshi.min",
	"magula",
	"magula.min",
	"mono-blue",
	"mono-blue.min",
	"monokai",
	"monokai.min",
	"monokai-sublime",
	"monokai-sublime.min",
	"night-owl",
	"night-owl.min",
	"nnfx-dark",
	"nnfx-dark.min",
	"nnfx-light",
	"nnfx-light.min",
	"nord",
	"nord.min",
	"obsidian",
	"obsidian.min",
	"panda-syntax-dark",
	"panda-syntax-dark.min",
	"panda-syntax-light",
	"panda-syntax-light.min",
	"paraiso-dark",
	"paraiso-dark.min",
	"paraiso-light",
	"paraiso-light.min",
	"pojoaque",
	"pojoaque.min",
	"purebasic",
	"purebasic.min",
	"qtcreator-dark",
	"qtcreator-dark.min",
	"qtcreator-light",
	"qtcreator-light.min",
	"rainbow",
	"rainbow.min",
	"rose-pine",
	"rose-pine-dawn",
	"rose-pine-dawn.min",
	"rose-pine.min",
	"rose-pine-moon",
	"rose-pine-moon.min",
	"routeros",
	"routeros.min",
	"school-book",
	"school-book.min",
	"shades-of-purple",
	"shades-of-purple.min",
	"srcery",
	"srcery.min",
	"stackoverflow-dark",
	"stackoverflow-dark.min",
	"stackoverflow-light",
	"stackoverflow-light.min",
	"sunburst",
	"sunburst.min",
	"tokyo-night-dark",
	"tokyo-night-dark.min",
	"tokyo-night-light",
	"tokyo-night-light.min",
	"tomorrow-night-blue",
	"tomorrow-night-blue.min",
	"tomorrow-night-bright",
	"tomorrow-night-bright.min",
	"vs2015",
	"vs2015.min",
	"vs",
	"vs.min",
	"xcode",
	"xcode.min",
	"xt256",
	"xt256.min",
];
