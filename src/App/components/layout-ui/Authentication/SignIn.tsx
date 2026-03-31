import { createSignal, Setter } from "solid-js";
import { authType } from "./hooks";
import MyIcon from "@app/components/ui/MyIcon";
import { Separator } from "@component/ui/Separator";
import { Button, Input } from "@ui";
import { Turnstile, useTurnstile } from "@component/Turnstile";
import { onCleanup } from "solid-js";
import { useStore } from "@shared/store";
import { Auth } from "@lib";
import { hollow } from "hollow";

interface Props {
	setType: Setter<authType>;
}

export default function SignIn(props: Props) {
	const { dispatch } = useStore();
	const [username, setUsername] = createSignal("");
	const [password, setPassword] = createSignal("");
	const turn = useTurnstile();
	const request = async () => {
		const token = turn.token();
		if (!token) {
			turn.execute();
			return;
		}
		try {
			if (!password() || !username()) return;
			const responde = await Auth.signIn({
				username: username(),
				password: password(),
				turnstileToken: token,
			});
			if (responde.success) {
				const request = await Auth.getUser();
				if (request) {
					dispatch({
						domain: "account",
						type: "set-user",
						user: request.user,
					});
					dispatch({
						domain: "account",
						type: "set-connection",
						connection: { state: true, type: request.kind },
					});
				}
			} else {
				console.error(responde.error);
				hollow.events.emit("alert", {
					type: "error",
					message: "Something went wrong! Try again later.",
				});
			}
		} catch (e) {
			console.error(e);
			hollow.events.emit("alert", {
				type: "error",
				message: "Something went wrong! Try again later.",
			});
		} finally {
			turn.reset();
		}
	};
	onCleanup(() => {
		turn.clean();
	});
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
						// TODO $
						//onclick={() => props.setType("forgot-password")}
					>
						Forgot your password?
					</button>
				</div>
			</div>
			<Turnstile />
			<Button variant="secondary" class="w-full" onclick={request}>
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
