import { JSX, lazy, Suspense } from "solid-js";

interface Props {
	name: keyof typeof HollowIcons;
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
	buymecoffee: () => import("@assets/icons/buymecoffee.svg"),
	"chart-pie": () => import("@assets/icons/chart-pie.svg"),
	"check-square-outline": () =>
		import("@assets/icons/check-square-outline.svg"),
	"check-square": () => import("@assets/icons/check-square.svg"),
	"color-picker": () => import("@assets/icons/color-picker.svg"),
	"double-arrow-right": () => import("@assets/icons/double-arrow-right.svg"),
	"folder-close": () => import("@assets/icons/folder-close.svg"),
	"folder-open": () => import("@assets/icons/folder-open.svg"),
	gear: () => import("@assets/icons/gear.svg"),
	ghost: () => import("@assets/icons/ghost.svg"),
	loader: () => import("@assets/icons/loader.svg"),
	"mood-smile": () => import("@assets/icons/mood-smile.svg"),
	mosaic: () => import("@assets/icons/mosaic.svg"),
	"note-fill": () => import("@assets/icons/note-fill.svg"),
	"pen-ruler": () => import("@assets/icons/pen-ruler.svg"),
	pen: () => import("@assets/icons/pen.svg"),
	scroll: () => import("@assets/icons/scroll.svg"),
	server: () => import("@assets/icons/server.svg"),
	"tool-case": () => import("@assets/icons/tool-case.svg"),
	trash: () => import("@assets/icons/trash.svg"),
	"user-gear": () => import("@assets/icons/user-gear.svg"),
	vault: () => import("@assets/icons/vault.svg"),
	"x-square-outline": () => import("@assets/icons/x-square-outline.svg"),
	"x-square": () => import("@assets/icons/x-square.svg"),
	// Files subdirectory
	"files/file-check": () => import("@assets/icons/files/file-check.svg"),
	"files/file-description": () =>
		import("@assets/icons/files/file-description.svg"),
	"files/file-pen": () => import("@assets/icons/files/file-pen.svg"),
	"files/file-plus": () => import("@assets/icons/files/file-plus.svg"),
	// Tools subdirectory
	"tools/embed": () => import("@assets/icons/tools/embed.svg"),
	"tools/image": () => import("@assets/icons/tools/image.svg"),
	"tools/kanban": () => import("@assets/icons/tools/kanban.svg"),
	"tools/notebook": () => import("@assets/icons/tools/notebook.svg"),
};
