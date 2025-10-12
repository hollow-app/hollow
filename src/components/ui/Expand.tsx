import Sidepanel from "@components/animations/Sidepanel";
import Card from "@components/Card";
import Tool from "@components/Tool";
import { CardInfo } from "@type/CardInfo";
import { PlusIcon, TreesIcon } from "lucide-solid";
import { Accessor, createSignal, For, Setter, Show } from "solid-js";
// import HollowIcon from "@assets/icon-nobg.svg";
import { lazy } from "solid-js";

const Icon = lazy(() => import("@components/Icon"));

type ExpandProps = {
	isVisible: Accessor<boolean>;
};

export default function Expand({ isVisible }: ExpandProps) {
	const [hand, setHand] = createSignal(window.toolManager.hand);

	// const onSubmitNewCard = (e: SubmitEvent) => {
	// 	e.preventDefault();
	// 	const form = e.currentTarget as HTMLFormElement;
	// 	const input = form.elements.namedItem("card-name") as HTMLInputElement;
	// 	if (input.value != "") {
	// 		window.toolManager.addCard(input.value, hand()[selected()].name);
	// 	}
	// 	setHand([...window.toolManager.hand]);
	// 	input.value = "";
	// };

	return (
		<Sidepanel isVisible={isVisible}>
			<div class="border-secondary-10 mr-2 h-full border-l"></div>
		</Sidepanel>
	);
}
