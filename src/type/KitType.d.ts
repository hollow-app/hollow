export type KitType = {
	width: number;
	height: number;
	corner: number;
	opacity: number;
	border: { c: string; n: number };
	glass: boolean;
	shadow: boolean;
	xyz: { x: number; y: number; z: number };
	extra?: {
		fontSize: string;
		innerMargin: string;
		outerMargin: string;
	};
};
