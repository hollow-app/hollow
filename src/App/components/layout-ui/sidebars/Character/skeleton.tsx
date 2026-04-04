import { Button, Dialog, DialogContent, DialogTrigger } from "@ui";
import SignIn from "../../Authentication/SignIn";
import Authentication from "../../Authentication";
import { Auth } from "@lib";
import { Show } from "solid-js";
import { useStore } from "@app/store";

export function Skeleton() {
	const { state } = useStore();
	const onSignIn = () => {
		try {
			const response = Auth.signInViaSite();
		} catch (e) {}
	};
	return (
		<div>
			<div class="animate-pulse space-y-6">
				{/* Banner Skeleton */}
				<div class="bg-secondary-05 h-32 w-full rounded-xl" />

				<div class="px-6 pb-6">
					{/* Avatar Skeleton */}
					<div class="-mt-12 flex justify-start">
						<div class="border-secondary-10 bg-secondary-05 h-20 w-20 rounded-2xl border-3 shadow-lg" />
					</div>

					{/* Info Skeleton */}
					<div class="mt-4 space-y-4">
						<div class="space-y-2">
							<div class="bg-secondary-10 h-8 w-48 rounded" />
							<div class="bg-secondary-10 h-4 w-24 rounded" />
						</div>

						<div class="bg-secondary-10 h-4 w-32 rounded" />

						{/* XP Skeleton */}
						<div class="space-y-2">
							<div class="flex justify-between">
								<div class="bg-secondary-10 h-4 w-20 rounded" />
								<div class="bg-secondary-10 h-4 w-12 rounded" />
							</div>
							<div class="bg-secondary-10 h-1.5 w-full rounded-full" />
						</div>

						{/* Bio Skeleton */}
						<div class="space-y-2">
							<div class="bg-secondary-10 h-3 w-full rounded" />
							<div class="bg-secondary-10 h-3 w-5/6 rounded" />
							<div class="bg-secondary-10 h-3 w-4/6 rounded" />
						</div>

						{/* Meta Skeleton */}
						<div class="space-y-3 pt-2">
							<div class="bg-secondary-10 h-4 w-16 rounded" />
							<div class="flex flex-wrap gap-2">
								<div class="bg-secondary-10 h-6 w-24 rounded" />
								<div class="bg-secondary-10 h-6 w-20 rounded" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<Show when={state.account.connection.type === "offline"}>
				<div class="mx-auto flex w-fit items-center gap-1 text-xs">
					<span class="text-secondary-50">You are not logged,</span>{" "}
					{/* <Dialog> */}
					{/* 	<DialogTrigger> */}
					<button class="hover:underline" onclick={onSignIn}>
						sign In
					</button>
					{/* 	</DialogTrigger> */}
					{/* 	<DialogContent> */}
					{/* 		<Authentication /> */}
					{/* 	</DialogContent> */}
					{/* </Dialog> */}
				</div>
			</Show>
		</div>
	);
}
