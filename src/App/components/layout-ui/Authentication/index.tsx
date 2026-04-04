import { Component } from "solid-js";
import { useStore } from "@app/store";
import { AuthenticationProps, useAuthentication } from "./hooks";
import { DialogContext, GradientEffect } from "@ui";
import { Motion, Presence } from "solid-motionone";
import { Show } from "solid-js";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import RecoverAccount from "./RecoverAccount";
import ResetPassword from "./ResetPassword";
import { useContext } from "solid-js";

const Authentication: Component<AuthenticationProps> = (props) => {
	const store = useStore();
	const { state, actions } = useAuthentication(props);

	return (
		<div class="bg-secondary border-secondary-10 relative flex flex-col items-center gap-4 overflow-hidden rounded-xl border p-10 text-center transition-all">
			<GradientEffect
				class="-top-100 left-10"
				size={200}
				variant={"05"}
			/>
			<Presence exitBeforeEnter>
				<Show when={state.type() === "sign-up"}>
					<Motion.div
						class="flex flex-col items-center gap-4"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
					>
						<SignUp setType={state.setType} />
					</Motion.div>
				</Show>
				<Show when={state.type() === "sign-in"}>
					<Motion.div
						class="flex flex-col items-center gap-4"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
					>
						<SignIn setType={state.setType} />
					</Motion.div>
				</Show>
				<Show when={state.type() === "recover-account"}>
					<Motion.div
						class="flex flex-col items-center gap-4"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
					>
						<RecoverAccount setType={state.setType} />
					</Motion.div>
				</Show>
				<Show when={state.type() === "reset-password"}>
					<Motion.div
						class="flex flex-col items-center gap-4"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
					>
						<ResetPassword setType={state.setType} />
					</Motion.div>
				</Show>
			</Presence>
		</div>
	);
};

export default Authentication;
