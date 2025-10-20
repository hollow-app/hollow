export type ConfirmType = {
	type: string;
	message: string;
	onAccept: () => void;
	accLabel?: string;
	refLabel?: string;
};
