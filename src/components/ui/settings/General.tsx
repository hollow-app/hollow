import { Suspense } from "solid-js";
//import { PatreonIcon } from "@assets/patreon.svg";

export default function General() {
        const handleRealmToggle = (
                e: Event & { currentTarget: HTMLInputElement },
        ) => {
                localStorage.realmToggleOnStartup = JSON.stringify(
                        e.currentTarget.checked,
                );
        };
        return (
                <div class="flex flex-col gap-5 p-10 text-neutral-950 dark:text-neutral-200">
                        <div class="flex justify-between">
                                <div class="flex h-fit w-full flex-col font-mono">
                                        <h1 class="text-3xl font-bold">
                                                Hollow
                                        </h1>
                                        <p class="text-secondary-50 text-xl">
                                                0.0.3
                                        </p>
                                </div>
                                <div>
                                        <a
                                                class="button-secondary flex"
                                                href={
                                                        "https://www.patreon.com/c/hollow_app"
                                                }
                                                target="_blank"
                                        >
                                                <svg
                                                        viewBox="0 0 1100 1100"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill-rule="evenodd"
                                                        clip-rule="evenodd"
                                                        stroke-linejoin="round"
                                                        stroke-miterlimit="2"
                                                        class="my-3 h-5 w-5"
                                                >
                                                        <path
                                                                d="M1033.05 324.45c-.19-137.9-107.59-250.92-233.6-291.7-156.48-50.64-362.86-43.3-512.28 27.2-181.1 85.46-237.99 272.66-240.11 459.36-1.74 153.5 13.58 557.79 241.62 560.67 169.44 2.15 194.67-216.18 273.07-321.33 55.78-74.81 127.6-95.94 216.01-117.82 151.95-37.61 255.51-157.53 255.29-316.38z"
                                                                fill="var(--secondary-color-80)"
                                                        />
                                                </svg>
                                        </a>
                                </div>
                        </div>
                        <hr class="bg-secondary-10 h-px w-full border-0" />
                        <div class="flex items-center justify-between">
                                <div>
                                        <h1 class="text-lg font-bold">
                                                Auto Update
                                        </h1>
                                        <p class="text-secondary-60 text-sm">
                                                Note: this feature is not
                                                supported yet.
                                        </p>
                                </div>
                                <div class="toggle-switch">
                                        <input
                                                class="toggle-input"
                                                id="auto-update-toggle"
                                                type="checkbox"
                                                disabled
                                        />
                                        <label
                                                class="toggle-label"
                                                for="auto-update-toggle"
                                        ></label>
                                </div>
                        </div>
                        <hr class="bg-secondary-10 h-px w-full border-0" />
                        <div class="flex items-center justify-between">
                                <h1 class="text-lg font-bold">
                                        Select a Realm each time the app opens.
                                </h1>

                                <div class="toggle-switch">
                                        <input
                                                class="toggle-input"
                                                type="checkbox"
                                                id="choose-realm-toggle"
                                                checked={JSON.parse(
                                                        localStorage.realmToggleOnStartup ??
                                                                "false",
                                                )}
                                                onchange={handleRealmToggle}
                                        />
                                        <label
                                                class="toggle-label"
                                                for="choose-realm-toggle"
                                        ></label>
                                </div>
                        </div>
                </div>
        );
}
