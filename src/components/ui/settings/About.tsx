import { For } from "solid-js";

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
		link: "https://hollow-space.vercel.app/",
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
		link: "https://hollow-space.vercel.app/documentation",
	},
	{
		title: "BuyMeCoffee",
		description: "Support Hollow’s development.",
		label: "Support",
		link: "buymeacoffee.com/ryusufe",
	},
];
export default function About() {
	return (
		<div class="h-fit w-full p-10">
			<h1 class="mb-5 text-5xl font-extrabold text-neutral-950 dark:text-neutral-50">
				About
			</h1>
			<div class="w-full space-y-5 p-5">
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
								class="button secondary no-underline"
							>
								{link.label}
							</a>
						</div>
					)}
				</For>
			</div>
		</div>
	);
}
