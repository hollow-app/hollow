import { JSX, lazy, Suspense } from "solid-js";

export type MyIconsType = keyof typeof HollowIcons;
interface Props {
	name: MyIconsType;
	class?: string;
	style?: JSX.CSSProperties;
}
export default function MyIcon(props: Props) {
	const IconComponent = lazy(HollowIcons[props.name]);

	return (
		<Suspense>
			<IconComponent
				class={props.class ?? ""}
				style={props.style ?? {}}
			/>
		</Suspense>
	);
}

export function MyIconFun(props: Props) {
	return (ov: any) => {
		return <MyIcon {...props} {...ov} />;
	};
}

const HollowIcons = {
	"alert-square-outline": () =>
		import("@assets/icons/alert-square-outline.svg"),
	"alert-square": () => import("@assets/icons/alert-square.svg"),
	"alert-triangle-outline": () =>
		import("@assets/icons/alert-triangle-outline.svg"),
	"alert-triangle": () => import("@assets/icons/alert-triangle.svg"),
	"align-box-left-top": () => import("@assets/icons/align-box-left-top.svg"),
	"bell-ringing": () => import("@assets/icons/bell-ringing.svg"),
	bell: () => import("@assets/icons/bell.svg"),
	"check-square-outline": () =>
		import("@assets/icons/check-square-outline.svg"),
	"check-square": () => import("@assets/icons/check-square.svg"),
	"color-picker": () => import("@assets/icons/color-picker.svg"),
	"double-arrow-right": () => import("@assets/icons/double-arrow-right.svg"),
	"folder-close": () => import("@assets/icons/folder-close.svg"),
	"folder-open": () => import("@assets/icons/folder-open.svg"),
	gear: () => import("@assets/icons/gear.svg"),
	"gear-outline": () => import("@assets/icons/gear-outline.svg"),
	"gear-fill": () => import("@assets/icons/gear-fill.svg"),
	ghost: () => import("@assets/icons/ghost.svg"),
	loader: () => import("@assets/icons/loader.svg"),
	"mood-smile": () => import("@assets/icons/mood-smile.svg"),
	mosaic: () => import("@assets/icons/mosaic.svg"),
	receipt: () => import("@assets/icons/receipt.svg"),
	"pen-ruler": () => import("@assets/icons/pen-ruler.svg"),
	pen: () => import("@assets/icons/pen.svg"),
	"pen-outline": () => import("@assets/icons/pen-outline.svg"),
	"edit-pen": () => import("@assets/icons/edit-pen.svg"),
	"edit-pen-outline": () => import("@assets/icons/edit-pen-outline.svg"),
	scroll: () => import("@assets/icons/scroll.svg"),
	trash: () => import("@assets/icons/trash.svg"),
	"trash-outline": () => import("@assets/icons/trash-outline.svg"),
	"user-gear": () => import("@assets/icons/user-gear.svg"),
	"tool-case-outline": () => import("@assets/icons/tool-case-outline.svg"),
	vault: () => import("@assets/icons/vault.svg"),
	"x-square-outline": () => import("@assets/icons/x-square-outline.svg"),
	"x-square": () => import("@assets/icons/x-square.svg"),
	comet: () => import("@assets/icons/comet.svg"),
	image: () => import("@assets/icons/image.svg"),
	cards: () => import("@assets/icons/cards.svg"),
	archive: () => import("@assets/icons/archive.svg"),
	calendar: () => import("@assets/icons/calendar.svg"),
	"home-outline": () => import("@assets/icons/home-outline.svg"),
	"home-2-fill": () => import("@assets/icons/home-2-fill.svg"),
	"pencil-alt": () => import("@assets/icons/pencil-alt.svg"),
	"bell-outline": () => import("@assets/icons/bell-outline.svg"),
	"bell-fill": () => import("@assets/icons/bell-fill.svg"),
	"strongbox-outline": () => import("@assets/icons/strongbox-outline.svg"),
	"strongbox-ghost": () => import("@assets/icons/strongbox-ghost.svg"),
	"strongbox-fill": () => import("@assets/icons/strongbox-fill.svg"),
	"pen-tool-fill": () => import("@assets/icons/pen-tool-fill.svg"),
	"designtools-outline": () =>
		import("@assets/icons/designtools-outline.svg"),
	"designtools-fill": () => import("@assets/icons/designtools-fill.svg"),
	"menu-board-outline": () => import("@assets/icons/menu-board-outline.svg"),
	"broom-outline": () => import("@assets/icons/broom-outline.svg"),
	// Files subdirectory
	"files/file-check": () => import("@assets/icons/files/file-check.svg"),
	"files/file-description": () =>
		import("@assets/icons/files/file-description.svg"),
	"files/file-pen": () => import("@assets/icons/files/file-pen.svg"),
	"files/file-plus": () => import("@assets/icons/files/file-plus.svg"),
	"files/file-x": () => import("@assets/icons/files/file-x.svg"),
	// Tools subdirectory
	"tools/embed": () => import("@assets/icons/tools/embed.svg"),
	"tools/image": () => import("@assets/icons/tools/image.svg"),
	"tools/kanban": () => import("@assets/icons/tools/kanban.svg"),
	"tools/notebook": () => import("@assets/icons/tools/notebook.svg"),
};
