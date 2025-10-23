export type ImageType = {
	id: string;
	url: string;
	caption?: string;
	alt?: string;
	objectFit: "contain" | "cover" | "fill" | "none" | "scale-down";
	position?: {
		x: number;
		y: number;
	};
};
