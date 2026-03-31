import MyIcon from "@app/components/ui/MyIcon";
import { Separator } from "@component/ui/Separator";
import { Button, Input } from "@ui";
import { createSignal, Setter } from "solid-js";
import { authType } from "./hooks";
import { Turnstile, useTurnstile } from "@component/Turnstile";
import { onCleanup } from "solid-js";
import { Auth } from "@lib";
import { Show } from "solid-js";
import { hollow } from "hollow";

interface Props {
	setType: Setter<authType>;
}

export default function SignUp(props: Props) {
	const turn = useTurnstile();
	const [discordId, setDiscordId] = createSignal("");
	const [username, setUsername] = createSignal("");
	const [password, setPassword] = createSignal("");
	const [confirmPassword, setConfirmPassword] = createSignal("");
	//
	const [recoveryKey, setRecoveryKey] = createSignal("");

	const request = async () => {
		const token = turn.token();
		if (!token) {
			turn.execute();
			return;
		}
		try {
			if (!password() || !username() || password() !== confirmPassword())
				return;
			const response = await Auth.signUp({
				username: username(),
				password: password(),
				turnstileToken: token,
				discordId: discordId(),
			});
			if (response.success) {
				setRecoveryKey(response.recoveryKey);
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
		<Show
			when={!recoveryKey()}
			fallback={
				<RecoveryKeyComponent
					recoveryKey={recoveryKey()}
					setType={props.setType}
				/>
			}
		>
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
			<Turnstile />
			<Button variant="secondary" class="w-full" onclick={request}>
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
		</Show>
	);
}

const RecoveryKeyComponent = (props: {
	recoveryKey: string;
	setType: Setter<authType>;
}) => {
	const copy = () => {
		navigator.clipboard.writeText(props.recoveryKey);
		hollow.events.emit("alert", {
			type: "success",
			message: "Recovery key copied to clipboard.",
		});
	};
	const onRecoveryKeyInput = (
		e: InputEvent & { currentTarget: HTMLInputElement },
	) => {
		if (e.currentTarget.value === props.recoveryKey) {
			props.setType("sign-in");
		}
	};

	return (
		<div class="flex flex-col items-center gap-6">
			<div class="w-full max-w-sm rounded-xl border border-neutral-200 p-5 shadow-sm dark:border-neutral-700">
				<p class="mb-2 text-sm text-neutral-500">
					This is your recovery key. Please store it securely. You
					will need it to recover your account.
				</p>
				<div class="flex items-center justify-between rounded-md border border-neutral-300 px-4 py-2 font-mono text-sm text-neutral-900 dark:border-neutral-600 dark:text-neutral-100">
					{props.recoveryKey}
					<button
						class="ml-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
						onClick={copy}
					>
						Copy
					</button>
				</div>
			</div>
			<div class="flex w-full max-w-sm flex-col gap-2">
				<label
					class="text-sm text-neutral-600 dark:text-neutral-400"
					for="confirmRecovery"
				>
					Please type the recovery key to confirm
				</label>
				<Input
					id="confirmRecovery"
					type="text"
					class="w-full grow"
					onInput={onRecoveryKeyInput}
					placeholder="Paste your recovery key here"
				/>
				<p class="text-xs text-neutral-500 dark:text-neutral-400">
					Once confirmed, you will be redirected to your account.
				</p>
			</div>
		</div>
	);
};
