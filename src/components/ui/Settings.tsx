import { JSX, ParentProps, Show } from "solid-js";

interface SettingsGroupProps extends ParentProps {
    title: string;
    description?: string | JSX.Element;
    class?: string;
}

export function SettingsGroup(props: SettingsGroupProps) {
    return (
        <div class={`flex flex-col gap-6 p-6 ${props.class || ""}`}>
            <div class="flex flex-col gap-1">
                <h3 class="text-xl font-bold">{props.title}</h3>
                <Show when={props.description}>
                    <div class="text-xs text-neutral-500">{props.description}</div>
                </Show>
            </div>
            <div class="border-secondary-10 space-y-6 border-l px-5">
                {props.children}
            </div>
        </div>
    );
}

interface SettingsItemProps {
    title: string;
    description?: string | JSX.Element;
    children: JSX.Element;
    class?: string;
}

export function SettingsItem(props: SettingsItemProps) {
    return (
        <div class={`flex items-center justify-between ${props.class || ""}`}>
            <div class="space-y-0.5">
                <p class="text-sm font-semibold">{props.title}</p>
                <Show when={props.description}>
                    <div class="text-xs text-neutral-500">{props.description}</div>
                </Show>
            </div>
            <div class="flex items-center gap-3">
                {props.children}
            </div>
        </div>
    );
}
