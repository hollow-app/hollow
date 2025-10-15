import { Accessor, JSX, Show } from "solid-js";
import { Motion, Presence } from "solid-motionone";

type SidepanelProps = {
	children: JSX.Element;
	isVisible: Accessor<boolean>;
	overflowVisible?: boolean;
};

export default function Sidepanel({
	children,
	isVisible,
	overflowVisible,
}: SidepanelProps) {
	return (
		<Presence exitBeforeEnter>
			<Show when={isVisible()}>
				<Motion
					initial={{
						opacity: 0,
						width: "0px",
						// margin: "calc(var(--spacing) * 2) 0 0 0",
					}}
					animate={{
						opacity: 1,
						width: "calc(var(--spacing) * 104)",
						// margin: "calc(var(--spacing) * 2) 0 0 calc(var(--spacing) * 2)",
					}}
					exit={{
						opacity: 0,
						width: "0px",
						// margin: "calc(var(--spacing) * 2) 0 0 0",
					}}
					transition={{ duration: 0.5 }}
					class="bg-secondary flex max-h-full shrink-0 flex-col overflow-hidden"
					classList={{ "hover:overflow-visible": overflowVisible }}
				>
					{children}
				</Motion>
			</Show>
		</Presence>
	);
}
