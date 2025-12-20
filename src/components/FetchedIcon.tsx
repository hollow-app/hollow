import { JSX, onMount, Show } from "solid-js";
import { createResource, Suspense } from "solid-js";
import MyIcon, { MyIconFun, MyIconsType } from "./MyIcon";

interface FetchedIconProps {
	url?: string;
	svg?: string;
	class?: string;
	style?: Record<string, any>;
}
export default function FetchedIcon(props: FetchedIconProps) {
	const [Icon] = createResource<JSX.Element | SVGSVGElement>(async () => {
		let data = props.svg;

		if (!data) {
			if (!props.url) {
				throw new Error("No SVG or URL provided");
			}

			new URL(props.url);
			const fetched = await fetch(props.url);
			if (!fetched.ok) throw new Error("Fetch failed");
			data = await fetched.text();
		}

		const trimmed = data.trim();
		if (!trimmed.startsWith("<")) {
			return <MyIcon name={trimmed as MyIconsType} class={props.class} />;
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(trimmed, "image/svg+xml");
		const svg = doc.documentElement;

		if (svg.tagName.toLowerCase() !== "svg") {
			throw new Error("Invalid SVG markup");
		}

		svg.setAttribute("class", `fetched-icon ${props.class ?? ""}`);

		if (props.style) {
			svg.setAttribute(
				"style",
				Object.entries(props.style)
					.map(([k, v]) => `${k}: ${v};`)
					.join(" "),
			);
		}

		svg.removeAttribute("width");
		svg.removeAttribute("height");

		return svg;
	});

	return (
		<Suspense>
			<Show
				when={!Icon.error}
				fallback={
					<MyIcon
						name="double-arrow-right"
						class={props.class}
						style={props.style}
					/>
				}
			>
				{Icon()}
			</Show>
		</Suspense>
	);
}
