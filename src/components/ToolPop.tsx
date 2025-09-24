import { HandType } from "@type/HandType";
import { Setter } from "solid-js";
import Icon from "./Icon";

export default function ToolPop({
	tool,
	setTool,
}: {
	tool: Omit<HandType, "cards">;
	setTool: Setter<Omit<HandType, "cards">>;
}) {
	const handleClose = () => {
		window.hollowManager.emit("tool-info", null);
	};
	return (
		<div class="bg-secondary border-secondary-15 shadow-popup animate-fadeIn pointer-events-auto absolute h-fit w-fit rounded-xl border-1 z-3">
			<div class="box-border flex h-fit w-[280px] flex-col justify-between gap-4 p-4">
				<div class="mx-auto flex items-center gap-3">
					<Icon
						name={tool.icon}
						class="border-secondary-15 h-16 w-16 rounded-xl border-2 p-2 text-gray-950 transition-all duration-200 hover:scale-105 dark:text-gray-50"
					/>
					<div class="flex flex-col items-center gap-1">
						<h2 class="text-lg font-semibold text-gray-950 dark:text-gray-50">
							{tool.title}
						</h2>
						<span class="text-secondary-40 bg-secondary-15 rounded-full px-2 py-0.5 text-sm">
							v{tool.version}
						</span>
					</div>
				</div>

				<div class="border-secondary-15 flex flex-col gap-4 border-t border-dashed pt-4">
					<div class="text-secondary-40 flex flex-col gap-3">
						<div class="flex flex-col gap-1">
							<span class="text-sm font-medium">Author</span>
							<a
								href={tool.authorUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="text-primary inline-flex items-center gap-1 transition-colors hover:underline"
							>
								{tool.author}
							</a>
						</div>

						<div class="flex flex-col gap-1">
							<span class="text-sm font-medium">Description</span>
							<span class="text-sm text-gray-950 dark:text-gray-50">
								{tool.description}
							</span>
						</div>

						<div class="flex flex-col gap-1">
							<span class="text-sm font-medium">DB Version</span>
							<span class="text-sm text-gray-950 dark:text-gray-50">
								{tool.dbVersion}
							</span>
						</div>
					</div>
				</div>

				<div class="border-secondary-15 flex justify-center border-t border-dashed pt-3">
					<button
						onclick={handleClose}
						class="button-secondary"
						style={{ "--w": "100%" }}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
