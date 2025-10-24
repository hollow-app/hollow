import { XIcon } from "lucide-solid";
import { ComponentProps, JSX, Show } from "solid-js";

type PopupWrapperProps = {
	Icon: (props: ComponentProps<"svg">) => any;
	title: string;
	children: JSX.Element;
	onClose?: () => void;
	shadow?: boolean;
};

export default function PopupWrapper({
	Icon,
	title,
	children,
	onClose,
	shadow = true,
}: PopupWrapperProps) {
	return (
		<div classList={{ "pop-up": shadow }}>
			<div class="up-pop pointer-events-auto flex flex-col gap-3">
				<div class="title-panel flex h-fit w-full items-center gap-2">
					<Icon class="text-secondary-50 m-1 size-5" />
					<h1 class="h1-title">{title}</h1>
					<Show when={onClose}>
						<button
							class="bg-secondary-10 group ml-auto rounded-full"
							onclick={onClose}
						>
							<XIcon class="text-secondary-50 size-4 p-0.5 opacity-0 group-hover:opacity-100" />
						</button>
					</Show>
				</div>

				{children}
			</div>
		</div>
	);
}
