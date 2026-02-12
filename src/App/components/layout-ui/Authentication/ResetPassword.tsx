import { createSignal, Setter } from "solid-js";
import { authType } from "./hooks";
import MyIcon from "@app/components/ui/MyIcon";
import { Separator } from "@component/ui/Separator";
import { Button, Input } from "@ui";

interface Props {
	setType: Setter<authType>;
}

export default function ResetPassword(props: Props) {
	const [valid, setValid] = createSignal(false);
	const [password, setPassword] = createSignal("");
	return (
		<>
			<MyIcon
				class="bg-secondary-10 size-10 rounded-xl p-2"
				name={"password2"}
			/>
			<div class="flex w-full flex-col items-center gap-1">
				<div class="text-sm font-medium tracking-tight">
					Reset Password
				</div>
				<div class="text-secondary-50 max-w-83">
					For your security, choose a strong new password.
				</div>
			</div>
			<Separator />
			<div class="flex w-90 flex-col gap-4 pb-3">
				<Input placeholder="Password" type="password" icon="password" />
				<Input
					placeholder="Confirm Password"
					type="password"
					icon="password"
				/>
			</div>
			<Button variant="secondary" class="w-full">
				Reset
			</Button>
			<span class="text-secondary-40 text-sm">
				Go back to{" "}
				<button
					class="text-secondary-foreground hover:underline"
					onclick={() => props.setType("sign-in")}
				>
					Sign In
				</button>
			</span>
		</>
	);
}
