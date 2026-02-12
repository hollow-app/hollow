import { Setter } from "solid-js";
import { authType } from "./hooks";
import MyIcon from "@app/components/ui/MyIcon";
import { Separator } from "@component/ui/Separator";
import { Button, Input } from "@ui";

interface Props {
	setType: Setter<authType>;
}

export default function SignIn(props: Props) {
	return (
		<>
			<MyIcon
				class="bg-secondary-10 size-10 rounded-xl p-2"
				name={"user"}
			/>
			<div class="flex w-full flex-col items-center gap-1">
				<div class="text-sm font-medium tracking-tight">Sign In</div>
				<div class="text-secondary-50 max-w-83">
					Welcome back! Log in to your account below. Enter your
					credentials to continue.
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
				Sign In With Discord
			</Button>
			<Separator variant={15} label="or" />
			<div class="flex w-full flex-col gap-4 pb-3">
				<Input placeholder="Username" icon="username" />
				<div class="flex flex-col items-start gap-1">
					<Input
						placeholder="Password"
						type="password"
						icon="password"
					/>
					<button
						class="text-secondary-50 w-fit text-start text-xs hover:underline"
						onclick={() => props.setType("forgot-password")}
					>
						Forgot your password?
					</button>
				</div>
			</div>
			<Button variant="secondary" class="w-full">
				Sign In
			</Button>
			<span class="text-secondary-40 text-sm">
				Don’t have an account?{" "}
				<button
					class="text-secondary-foreground hover:underline"
					onclick={() => props.setType("sign-up")}
				>
					Create Account
				</button>
			</span>
		</>
	);
}
