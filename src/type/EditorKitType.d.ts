export type EditorKitType = {
	tool: string;
	card: string;
	it: KitType;
	setIt: Setter<KitType>;
	save: () => void;
};
