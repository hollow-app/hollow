import {
	createMemo,
	createResource,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
	Suspense,
} from "solid-js";
import { FormType, TagType } from "@app/type/hollow";
import useTags from "@app/hooks/useTags";
import { hollow } from "../../../../hollow";
import Loading from "@app/components/ui/Loading";
import { CircleFadingPlusIcon } from "lucide-solid";
import {
	Combobox,
	Tag,
	ColorButton,
	EmojiButton,
	NumberInput,
	SettingsGroup,
	SettingsItem,
} from "@ui";
import useGrid from "@app/hooks/useGrid";
import { readableColor } from "polished";
import { useStore } from "@store";
import { renderMarkdown } from "@app/managers/Markdown";
import SettingsPanel from "./SettingsPanel";

export default function Appearance() {
	return (
		<SettingsPanel>
			<CanvasSettings />
			<hr class="bg-secondary-10 mx-auto my-4 h-px w-full border-0" />
			<ColorSettings />
			<hr class="bg-secondary-10 mx-auto my-4 h-px w-full border-0" />
			<CodeThemeSettings />
			<hr class="bg-secondary-10 mx-auto my-4 h-px w-full border-0" />
			<TagsEditor />
		</SettingsPanel>
	);
}

function CanvasSettings() {
	const draft = "appearance.canvas";
	const { state, dispatch } = useStore();
	const gridGap = createMemo<number>(() => state.settings["grid-gap"]);
	const gridSize = createMemo<number>(
		() => state.settings["grid-size"] as number,
	);
	const setGapBetweenCards = (v: number) => {
		dispatch(
			{
				domain: "settings",
				type: "set-configs",
				configs: {
					"grid-gap": v,
				},
			},
			{ draft },
		);
	};

	const setGrid_size = (v: number) => {
		dispatch(
			{
				domain: "settings",
				type: "set-configs",
				configs: {
					"grid-size": v,
				},
			},
			{ draft },
		);
	};

	onMount(() => {
		dispatch(
			{
				type: "DRAFT_START",
				path: "settings",
			},
			{ draft },
		);
	});
	onCleanup(() => {
		dispatch(
			{
				type: "DRAFT_COMMIT",
			},
			{ draft },
		);
	});

	return (
		<SettingsGroup title="Canvas">
			<SettingsItem
				title="Grid Size"
				description="Number of columns inside the canvas."
			>
				<div class="w-50">
					<NumberInput
						value={gridSize()}
						setValue={setGrid_size}
						direct
					/>
				</div>
			</SettingsItem>
			<SettingsItem
				title="Grid Gap"
				description="Change the gap between cards"
			>
				<div class="w-50">
					<NumberInput
						value={gridGap()}
						setValue={setGapBetweenCards}
						direct
					/>
				</div>
			</SettingsItem>
		</SettingsGroup>
	);
}

function ColorSettings() {
	const { state, dispatch } = useStore();
	const realmId = state.realm.current.id;
	const primaryColor = createMemo(
		() =>
			JSON.parse(localStorage.getItem(`${realmId}-color-primary`))
				.savedColor,
	);
	const secondaryColor = createMemo(
		() =>
			JSON.parse(localStorage.getItem(`${realmId}-color-secondary`))
				.savedColor,
	);

	const setPrimaryColor = (c: string) => {
		dispatch({
			domain: "realm",
			type: "update-colors",
			colors: { primary: c },
		});
	};
	const setSecondaryColor = (c: string) => {
		dispatch({
			domain: "realm",
			type: "update-colors",
			colors: { secondary: c },
		});
	};

	return (
		<SettingsGroup title="Colors">
			<SettingsItem
				title="Primary Color"
				description="Primary color used for highlighting important elements in the app."
			>
				<ColorButton
					color={primaryColor()}
					setColor={setPrimaryColor}
				/>
			</SettingsItem>
			<hr class="bg-secondary-10 h-px w-full border-0" />
			<SettingsItem
				title="Secondary Color"
				description="Secondary color used for the background theme."
			>
				<ColorButton
					color={secondaryColor()}
					setColor={setSecondaryColor}
				/>
			</SettingsItem>
		</SettingsGroup>
	);
}

const exampleCode = () => `
\`\`\`js
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet("Theme Tester");
\`\`\`
`;

function CodeThemeSettings() {
	const { state, dispatch } = useStore();
	const [md] = createResource(exampleCode, () =>
		renderMarkdown(exampleCode(), "code-theme-example"),
	);
	const codeTheme = createMemo(() => state.settings["code-theme"]);

	const useCodeTheme = async (v: string) => {
		dispatch({
			domain: "settings",
			type: "set-configs",
			configs: { "code-theme": v },
		});
		dispatch({ domain: "code-theme", type: "set-theme", name: v });
	};

	return (
		<SettingsItem
			title="Code Theme"
			description="All themes can be easily previewed on Highlight.js."
		>
			<a
				href={"https://highlightjs.org/examples"}
				target="_blank"
				class="hidden"
			>
				Highlight.js
			</a>
			<div class="flex h-40 items-center overflow-hidden">
				<Show when={codeTheme()} fallback={<Loading />}>
					<Suspense>
						<div class="markdown-preview" innerHTML={md()} />
					</Suspense>
				</Show>
			</div>
			<div class="w-70">
				<Combobox
					value={codeTheme()}
					items={codeThemes}
					onselect={useCodeTheme}
				/>
			</div>
		</SettingsItem>
	);
}

function TagsEditor() {
	const { state, dispatch } = useStore();
	const tags = createMemo(() => {
		return state.settings["custom-tags"];
	});

	const submit = (
		data: { name: string; background: string },
		prev?: { name: string; background: string },
	) => {
		const { name, background } = data;
		const updateNewName = prev && !tags().some((i) => i.name === prev.name);
		const newTag: TagType = {
			name,
			background: background ?? "#fff",
			foreground: readableColor(background ?? "#fff"),
		};
		if (!name) return;
		const newTags = updateNewName
			? [newTag, ...tags().filter((i) => i.name !== prev!.name)]
			: prev
				? tags().map((t) => (t.name === prev.name ? newTag : t))
				: [...tags(), newTag];
		dispatch({
			domain: "settings",
			type: "set-configs",
			configs: { "custom-tags": newTags },
		});
		hollow.events.emit("character-add-achievement", "🏷️ Classifier");
		useTags(newTags);
	};
	const onNewTag = (data?: { name: string; background: string }) => {
		const update = !!data;
		const form: FormType = {
			id: (update ? "update" : "new") + "-tag-form",
			title: (update ? "Update" : "New") + " Tag",
			description:
				"Add a new tag by entering its name and selecting a color.",
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
				},
				{
					key: "background",
					row: true,
					label: "Color",
					value: data?.background,
					type: "color",
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
					<h2 class="text-3xl font-extrabold text-neutral-950 dark:text-neutral-50">
						Tags
					</h2>
					<p class="mt-1 mb-5 text-xs text-neutral-500">
						{" "}
						Custom tags that will be used by tools.{" "}
					</p>
				</div>
				<button class="button-control" onclick={() => onNewTag()}>
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
