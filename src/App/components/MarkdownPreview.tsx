import { createResource, Suspense } from "solid-js";
import { manager } from "@managers/index";

type MarkdownPreviewProps = {
	value: () => string;
	uniqueNote: () => string;
};

export default function MarkdownPreview({
	value,
	uniqueNote,
}: MarkdownPreviewProps) {
	const [parsedMd] = createResource(value, () =>
		manager.markdown.renderMarkdown(value(), uniqueNote()),
	);

	return (
		<Suspense
			fallback={
				<div class="w-full animate-pulse space-y-5 py-10">
					<div class="grid grid-cols-3 gap-4">
						<div class="bg-secondary-20 col-span-2 h-2 rounded"></div>
						<div class="bg-secondary-20 col-span-1 h-2 rounded"></div>
					</div>
					<div class="bg-secondary-20 h-2 rounded"></div>
					<div class="grid grid-cols-4 gap-4">
						<div class="bg-secondary-20 col-span-3 h-2 rounded"></div>
						<div class="bg-secondary-20 col-span-1 h-2 rounded"></div>
					</div>
					<div class="bg-secondary-20 h-2 rounded"></div>
					<div class="grid grid-cols-5 gap-4">
						<div class="bg-secondary-20 col-span-2 h-2 rounded"></div>
						<div class="bg-secondary-20 col-span-3 h-2 rounded"></div>
					</div>
				</div>
			}
		>
			<div
				class="markdown-preview max-w-full pt-2 pb-4"
				innerHTML={parsedMd()}
			/>
		</Suspense>
	);
}
