import { TagType } from "@type/TagType";
import { Trash2Icon } from "lucide-solid";
import { readableColor } from "polished";
import { Setter } from "solid-js";
import ColorPick from "./ColorPick";

type TagEditorProps = {
	setTags: Setter<TagType[]> | any;
	tag: TagType;
};

export default function TagEditor({ tag, setTags }: TagEditorProps) {
	const onDelete = () => {
		setTags((prev: TagType[]) => prev.filter((i) => i.name !== tag.name));
	};
	const onNameChanged = (name: string) => {
		setTags((prev: TagType[]) => {
			const newl = [...prev];
			newl.find((i) => i.name === tag.name).name = name;
			return newl;
		});
	};
	const onColorChanged = (color: string) => {
		setTags((prev: TagType[]) => {
			const newl = [
				...prev.map((i) =>
					i.name === tag.name
						? {
								...i,
								background: color,
								foreground: readableColor(color),
							}
						: i,
				),
			];
			return newl;
		});
	};

	return (
		<div class="bg-secondary-10/50 flex items-center gap-1 rounded-lg p-2">
			<input
				class="input"
				value={tag.name}
				onfocusout={(e) => onNameChanged(e.currentTarget.value)}
				style={{
					"--bg-color": "var(--color-secondary-10)",
					"--bg-color-f": "var(--color-secondary-15)",
				}}
			/>
			<ColorPick color={() => tag.background} setColor={onColorChanged} />
			<button class="button-control red" onclick={onDelete}>
				<Trash2Icon />
			</button>
		</div>
	);
}
