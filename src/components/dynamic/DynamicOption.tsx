import ColorPick from "@components/dynamic/ColorPick";
import Dropdown from "@components/dynamic/Dropdown";
import EmojiPick from "@components/dynamic/EmojiPick";
import ImportFile from "@components/dynamic/ImportFile";
import NumberInput from "@components/dynamic/NumberInput";
import Slider from "@components/dynamic/Slider";
import WordInput from "@components/dynamic/WordInput";
import { ToolOption } from "@type/hollow";
import { Accessor, Match, onCleanup, onMount, Switch } from "solid-js";
import Segmented from "./Segmented";
import { options } from "marked";

type OptionType<T extends ToolOption["type"]> = Extract<
	ToolOption,
	{ type: T }
>;

export default function DynamicOption(props: {
	option: ToolOption;
	index: Accessor<number>;
}) {
	return (
		<Switch>
			<Match when={props.option.type === "text"}>
				<TextOption option={props.option as OptionType<"text">} />
			</Match>
			<Match when={props.option.type === "longtext"}>
				<LongTextOption
					option={props.option as OptionType<"longtext">}
				/>
			</Match>
			<Match when={props.option.type === "number"}>
				<NumberOption option={props.option as OptionType<"number">} />
			</Match>
			<Match when={props.option.type === "boolean"}>
				<BooleanOption
					option={props.option as OptionType<"boolean">}
					index={props.index}
				/>
			</Match>
			<Match when={props.option.type === "button"}>
				<ButtonOption option={props.option as OptionType<"button">} />
			</Match>
			<Match when={props.option.type === "color"}>
				<ColorOption option={props.option as OptionType<"color">} />
			</Match>
			<Match when={props.option.type === "emoji"}>
				<EmojiOption option={props.option as OptionType<"emoji">} />
			</Match>
			<Match when={props.option.type === "dropdown"}>
				<DropdownOption
					option={props.option as OptionType<"dropdown">}
				/>
			</Match>
			<Match when={props.option.type === "file"}>
				<FileOption option={props.option as OptionType<"file">} />
			</Match>
			<Match when={props.option.type === "range"}>
				<RangeOption option={props.option as OptionType<"range">} />
			</Match>
			<Match when={props.option.type === "keywords"}>
				<KeywordsOption
					option={props.option as OptionType<"keywords">}
				/>
			</Match>
			<Match when={props.option.type === "segmented"}>
				<SegmentedOption
					option={props.option as OptionType<"segmented">}
				/>
			</Match>
			<Match when={props.option.type === "custom"}>
				<CustomOption option={props.option as OptionType<"custom">} />
			</Match>
		</Switch>
	);
}
const TextOption = (props: { option: OptionType<"text"> }) => (
	<input
		type="text"
		class="input"
		{...props.option.attributes}
		value={props.option.value}
		onInput={(e) => {
			props.option.onAction(e.currentTarget.value);
		}}
	/>
);

const LongTextOption = (props: { option: OptionType<"longtext"> }) => (
	<textarea
		class="input w-full"
		{...props.option.attributes}
		value={props.option.value}
		onInput={(e) => props.option.onAction(e.currentTarget.value)}
	/>
);

const NumberOption = (props: { option: OptionType<"number"> }) => (
	<NumberInput
		value={props.option.value}
		setValue={props.option.onAction}
		min={props.option.min}
		max={props.option.max}
		direct
	/>
);

const BooleanOption = (props: {
	option: OptionType<"boolean">;
	index: Accessor<number>;
}) => (
	<div class="toggle-switch">
		<input
			class="toggle-input"
			id={`tool-option-toggle-${props.index()}`}
			type="checkbox"
			checked={props.option.value}
			onchange={(e) => props.option.onAction(e.currentTarget.checked)}
		/>
		<label
			class="toggle-label"
			for={`tool-option-toggle-${props.index()}`}
		></label>
	</div>
);

const ButtonOption = (props: { option: OptionType<"button"> }) => (
	<button
		type="button"
		onClick={props.option.onAction}
		class="button-secondary"
	>
		{props.option.value}
	</button>
);

const ColorOption = (props: { option: OptionType<"color"> }) => (
	<ColorPick color={props.option.value} setColor={props.option.onAction} />
);

const EmojiOption = (props: { option: OptionType<"emoji"> }) => (
	<button
		type="button"
		class={
			"bg-secondary-10 h-10 w-10 content-center rounded-xl text-center text-2xl text-gray-900 select-none dark:text-gray-50"
		}
	>
		<EmojiPick
			emo={props.option.value}
			emoChanged={props.option.onAction}
		/>
	</button>
);

const DropdownOption = (props: { option: OptionType<"dropdown"> }) => (
	<Dropdown
		value={props.option.value}
		placeholder={props.option.placeholder}
		options={props.option.options}
		onSelect={props.option.onAction}
	/>
);

const FileOption = (props: { option: OptionType<"file"> }) => (
	<ImportFile xfile={props.option.value} onChange={props.option.onAction} />
);

const RangeOption = (props: { option: OptionType<"range"> }) => (
	<Slider
		min={props.option.min}
		max={props.option.max}
		value={props.option.value}
		setValue={props.option.onAction}
	/>
);

const KeywordsOption = (props: { option: OptionType<"keywords"> }) => (
	<WordInput
		words={props.option.value}
		setWords={props.option.onAction}
		placeholder={props.option.placeholder}
	/>
);

const SegmentedOption = (props: { option: OptionType<"segmented"> }) => {
	return (
		<Segmented
			value={props.option.value}
			options={props.option.options}
			setValue={props.option.onAction}
		/>
	);
};

const CustomOption = (props: { option: OptionType<"custom"> }) => {
	let el: HTMLDivElement;
	onMount(() => {
		const obj = props.option.render(el, props.option);
		onCleanup(() => {
			obj.cleanup();
		});
	});
	return <div class="size-full" ref={el} />;
};
