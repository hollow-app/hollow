import { For } from "solid-js";
import SettingsPanel from "./SettingsPanel";

type LinksType = {
	title: string;
	description: string;
	label: string;
	link: string;
};

const links: LinksType[] = [
	{
		title: "Official Website",
		description:
			"Learn more about Hollow, explore features, and stay up to date.",
		label: "Visit",
		link: "https://hollowapp.pages.dev/",
	},
	{
		title: "Discord Server",
		description:
			"Join the community, ask questions, suggest features, or report bugs.",
		label: "Join",
		link: "https://discord.com/invite/E66D6G3DQ2",
	},
	{
		title: "GitHub",
		description: "Access development resources.",
		label: "Visit",
		link: "https://github.com/hollow-app",
	},
	{
		title: "Documentation",
		description: "Learn how to build plugins, and make the most of Hollow.",
		label: "Visit",
		link: "https://hollowapp.pages.dev/documentation",
	},
	{
		title: "BuyMeCoffee",
		description: "Support Hollow’s development.",
		label: "Support",
		link: "https://buymeacoffee.com/ryusufe",
	},
];
export default function About() {
	return (
		<SettingsPanel label="About">
			<For each={links}>
				{(link) => (
					<div class="flex justify-between">
						<div>
							<h2 class="text-xl font-bold text-neutral-700 dark:text-neutral-300">
								{link.title}
							</h2>
							<p class="text-sm text-neutral-600 dark:text-neutral-400">
								{link.description}
							</p>
						</div>
						<a
							href={link.link}
							target="_blank"
							class="outline-none hover:text-neutral-500"
						>
							{link.label}
						</a>
					</div>
				)}
			</For>
		</SettingsPanel>
	);
}
