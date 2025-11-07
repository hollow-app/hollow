export type VaultItem = {
	id: string;
	realm?: string;
	name: string;
	type: string;
	path: string;
	tags?: string[];
	uploadedAt: Date;
};
