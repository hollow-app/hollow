import MyIcon from "@app/components/ui/MyIcon";
import { Separator } from "@component/ui/Separator";
import { Button, Input } from "@ui";
import { Setter } from "solid-js";
import { authType } from "./hooks";

interface Props {
	setType: Setter<authType>;
}

export default function SignUp(props: Props) {
	return (
		<>
			<MyIcon
				class="bg-secondary-10 size-10 rounded-xl p-2"
				name={"user-add"}
			/>
			<div class="flex w-full flex-col items-center gap-1">
				<div class="text-sm font-medium tracking-tight">
					Create Account
				</div>
				<div class="text-secondary-50 max-w-83">
					Welcome! Create your free account below. It only takes a
					minute to get started.
				</div>
			</div>
			<Separator />
			<Button
				leftIcon="discord"
				variant="empty"
				class="w-full"
				style={{
					"--bg-color": "#566AF6",
					"--border-color": "#6b7eff",
					"--text-color": "white",
					"--icon-color": "white",
				}}
			>
				Sign Up With Discord
			</Button>
			<Separator variant={15} label="or" />
			<div class="flex w-full flex-col gap-4 pb-3">
				<Input placeholder="Username" icon="username" />
				<Input placeholder="Password" type="password" icon="password" />
				<Input
					placeholder="Confirm Password"
					type="password"
					icon="password"
				/>
			</div>
			<Button variant="secondary" class="w-full">
				Sign Up
			</Button>
			<span class="text-secondary-40 text-sm">
				Already have an account?{" "}
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
