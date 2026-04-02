import { Button, SettingsGroup } from "@ui";

export default function DangerZone() {
	return (
		<SettingsGroup
			title="Danger Zone"
			description="Irreversible actions that affect your entire account."
			class="text-red-600 dark:text-red-500"
		>
			<div>
				<Button.Root variant="destructive">Delete Account</Button.Root>
			</div>
		</SettingsGroup>
	);
}
