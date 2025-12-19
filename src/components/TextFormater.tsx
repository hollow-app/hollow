interface Props {
	value: any;
	setValue: (s: string) => void;
}
export default function TextFormater(props: Props) {
	const handleValueChange = (
		e: KeyboardEvent & { currentTarget: HTMLTextAreaElement },
	) => {
		if (e.ctrlKey && e.key === "Enter") {
			const textarea = e.currentTarget;
			try {
				const obj = JSON.parse(textarea.value);
				textarea.value = JSON.stringify(obj, null, 2);
			} catch (err) {
				console.error(err);
			}
		}
	};
	return (
		<textarea
			value={props.value}
			onKeyDown={handleValueChange}
			onInput={(e) => props.setValue(e.currentTarget.value)}
			class="input h-full w-full resize-none font-mono text-sm text-neutral-900"
			style={{
				"--padding-y": "calc(var(--spacing) * 2)",
				"--padding-x":
					"calc(var(--spacing) * 5) calc(var(--spacing) * 2)",
			}}
			placeholder="Enter JSON value"
		/>
	);
}
