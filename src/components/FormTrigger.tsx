import { FormType } from "@type/hollow";
import { createSignal, splitProps } from "solid-js";
import { JSX } from "solid-js";
import { hollow } from "../hollow";

type Props = FormType & Omit<JSX.HTMLAttributes<HTMLElement>, keyof FormType>;
export function FormTrigger(props: Props) {
	const [local, rest] = splitProps(props, [
		"id",
		"update",
		"title",
		"description",
		"options",
		"submit",
	]);
	const handleTrigger = () => {
		const form: FormType = local;
		hollow.events.emit("form", form);
	};

	return <div onClick={handleTrigger}>{props.children}</div>;
}
