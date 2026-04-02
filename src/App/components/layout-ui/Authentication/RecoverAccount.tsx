import { createSignal, resetErrorBoundaries, Setter } from "solid-js";
import { authType } from "./hooks";
import MyIcon from "@app/components/ui/MyIcon";
import { Separator } from "@component/ui/Separator";
import { Button, Input } from "@ui";
import { Turnstile, useTurnstile } from "@component/Turnstile";
import { onCleanup } from "solid-js";
import { Auth } from "@lib";
import { hollow } from "hollow";

interface Props {
	setType: Setter<authType>;
}

export default function RecoverAccount(props: Props) {
	const [username, setUsername] = createSignal("");
	const [recoveryKey, setRecoveryKey] = createSignal("");
	const turn = useTurnstile();

	const request = async () => {
		const token = turn.token();
		if (!token) {
			turn.execute();
			return;
		}
		try {
			if (!username() && !recoveryKey()) return;
			const response = await Auth.recoverAccount({
				username: username(),
				recoveryKey: recoveryKey(),
				turnstileToken: token,
			});
			if (response.success) {
				sessionStorage.setItem("recoverykey-code", response.code);
				props.setType("reset-password");
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
	onCleanup(() => {
		turn.clean();
	});

	return (
		<>
			<MyIcon
				class="bg-secondary-10 size-10 rounded-xl p-2"
				name={"unlock"}
			/>
			<div class="flex w-full flex-col items-center gap-1">
				<div class="text-sm font-medium tracking-tight">
					Recover Account
				</div>
				<div class="text-secondary-50 max-w-83">
					The passphrase was set during account setup. It is
					case-sensitive.
				</div>
			</div>
			<Separator />
			<div class="flex w-90 flex-col gap-4 pb-3">
				<Input placeholder="Username" icon="username" />
				<Input
					placeholder="Recovery Passphrase"
					type="password"
					icon="password"
				/>
			</div>
			<Turnstile />
			<Button.Root variant="secondary" class="w-full" onclick={request}>
				Verify Passphrase
			</Button.Root>
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
