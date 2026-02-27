import { Button, SettingsGroup } from "@ui";

export default function DangerZone() {
    return (
        <SettingsGroup
            title="Danger Zone"
            description="Irreversible actions that affect your entire account."
            class="text-red-600 dark:text-red-500"
        >
            <div>
                <Button variant="destructive">Delete Account</Button>
            </div>
        </SettingsGroup>
    );
}
