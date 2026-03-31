import { createSignal, onCleanup, onMount, Setter } from "solid-js";
import { authType } from "./hooks";
import MyIcon from "@app/components/ui/MyIcon";
import { Separator } from "@component/ui/Separator";
import { Button, Input } from "@ui";
import { Turnstile, useTurnstile } from "@component/Turnstile";
import { Auth } from "@lib";
import { hollow } from "hollow";

interface Props {
	setType: Setter<authType>;
}

export default function ResetPassword(props: Props) {
	const [code, setCode] = createSignal("");
	const [password, setPassword] = createSignal("");
	const [confirmPassword, setConfirmPassword] = createSignal("");
	const turn = useTurnstile();

	const request = async () => {
		const token = turn.token();
		if (!token) {
			turn.execute();
			return;
		}
		try {
			if (!code() || !password() || password() !== confirmPassword())
				return;
			const response = await Auth.resetPassword({
				code: code(),
				password: password(),
				turnstileToken: token,
			});
			if (response.success) {
				await Auth.signOut();
				props.setType("sign-in");
			} else {
				console.error(response.error);
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
	onMount(() => {
		const storedCode = sessionStorage.getItem("recoverykey-code");
		if (!storedCode) {
			props.setType("recover-account");
		} else {
			setCode(storedCode);
		}
	});
	onCleanup(() => {
		turn.clean();
	});

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
			<Turnstile />
			<Button variant="secondary" class="w-full" onclick={request}>
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
