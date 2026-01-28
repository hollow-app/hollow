import { AlertType } from "@type/hollow";
import { ParentComponent, splitProps } from "solid-js";
import { hollow } from "../hollow";
import { EventEmitterSource } from "@utils/manipulation/strings";

type Props = AlertType & {
	action?: () => Promise<AlertType | void>;
};
export const AlertTrigger: ParentComponent<Props> = (props) => {
	const [local, rest] = splitProps(props, [
		"title",
		"type",
		"message",
		"button",
		"duration",
		"onTimeOut",
	]);
	const handleTrigger = async () => {
		const alert: AlertType = local;
		const onLoadingFinished = await hollow.events.emitAsync("alert", alert);
		if (local.type === "loading") {
			const sourced = EventEmitterSource("source", onLoadingFinished);
			try {
				const result = await rest.action();
				if (result && sourced) {
					sourced["callback"](result);
				}
			} catch (err) {
				if (sourced)
					sourced?.callback?.({
						title: "Oops!",
						type: "error",
						message: "Something went wrong. Please try again.",
					});
			}
		}
	};

	return (
		<div onClick={handleTrigger} class="size-fit">
			{props.children}
		</div>
	);
};
