import { createSignal, Setter } from "solid-js";
import { PluginType } from "./hooks";
import Loading from "@components/ui/Loading";
import { Show } from "solid-js";
import { marked } from "marked";
import { useStore } from "@store";
import { getHand } from "@managers/Module/effects";

type Props = {
	plugin: PluginType;
	setSelectedPlugin: Setter<PluginType>;
	setSelectedMD: Setter<string>;
};
export default function PluginPreview(props: Props) {
	const { state } = useStore();
	const [loading, setLoading] = createSignal(false);

	const onClick = async () => {
		setLoading(true);
		try {
			const readme = await fetch(
				`https://raw.githubusercontent.com/${props.plugin.repo}/refs/heads/main/README.md`,
			);
			if (props.plugin.verified) {
				const rep = await fetch(
					`https://api.github.com/repos/${props.plugin.repo}`,
					{
						headers: {
							Accept: "application/vnd.github.v3+json",
						},
					},
				);
				const repJson = await rep.json();
				props.plugin.verified =
					props.plugin.verificationDate === repJson.updated_at;
			}
			const fetchedManifest = await (
				await fetch(
					`https://raw.githubusercontent.com/${props.plugin.repo}/main/manifest.json`,
				)
			).json();
			const isInstalled = getHand()[props.plugin.name.toLowerCase()];
			props.setSelectedPlugin({
				...props.plugin,
				...fetchedManifest,
				icon: isInstalled?.icon,
				installed: !!isInstalled,
				action_state: isInstalled
					? fetchedManifest.version === isInstalled.version
						? "uninstall"
						: "update"
					: "install",
			});
			props.setSelectedMD(await marked(await readme.text()));
		} catch (error) {
			console.log(error);
		}

		setLoading(false);
	};

	return (
		<div
			class="bg-secondary-10/40 border-secondary-15 hover:bg-secondary-10 relative m-2 h-35 cursor-pointer rounded border-1 p-5 transition-all active:scale-95"
			classList={{ "pointer-events-none": loading() }}
			onclick={onClick}
		>
			<Show when={!loading()} fallback={<Loading />}>
				<div>
					<h1 class="text-xl font-bold">{props.plugin.name}</h1>
					<p class="text-secondary-40 line-clamp-1">
						{props.plugin.desc}
					</p>
					<div class="text-secondary-40 mt-5 flex justify-between font-mono">
						<h2>by {props.plugin.author}</h2>
						<p>{props.plugin.version}</p>
					</div>
					<div class="flex justify-between">
						<button></button>
					</div>
				</div>
			</Show>
		</div>
	);
}
