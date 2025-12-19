import { onMount, Show } from "solid-js";
import { createResource, Suspense } from "solid-js";
import MyIcon from "./MyIcon";

interface FetchedIconProps {
	url?: string;
	svg?: string;
	class?: string;
	style?: Record<string, any>;
}
export default function FetchedIcon(props: FetchedIconProps) {
	const [Icon] = createResource<Element>(async () => {
		let data = props.svg;
		if (!data) {
			try {
				new URL(props.url);
			} catch {
				throw new Error("unvalid link");
			}
			const fetched = await fetch(props.url);
			data = await fetched.text();
			if (!fetched.ok) throw new Error("Fetch failed");
		}
		const parser = new DOMParser();
		const doc = parser.parseFromString(data, "image/svg+xml");
		const svg = doc.documentElement;
		svg.setAttribute("class", "fetched-icon " + (props.class ?? ""));
		props.style &&
			svg.setAttribute(
				"style",
				Object.entries(props.style)
					.map(([k, v]) => `${k}: ${v};`)
					.join("\n"),
			);
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
