import { JSX, splitProps } from "solid-js";

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
	size?: number;
	variant?: number | string;
}

export const GradientEffect = (props: Props) => {
	const [local, rest] = splitProps(props, [
		"size",
		"variant",
		"class",
		"style",
	]);
	return (
		<div
			class={"absolute " + local.class}
			style={{
				"--size": "calc(var(--spacing) * " + (local.size ?? 100) + ")",
				width: "var(--size)",
				height: "var(--size)",
				background:
					"radial-gradient(circle at center, var(--color-secondary-" +
					(local.variant ?? 20) +
					") 0%, transparent 50%)",
				...((local.style ?? {}) as JSX.CSSProperties),
			}}
			{...rest}
		/>
	);
};
