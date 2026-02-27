import { SettingsGroup, SettingsItem } from "@ui";

export default function Security() {
    return (
        <SettingsGroup
            title="Account Security"
            description="Keep your account safe and secure."
        >
            <SettingsItem title="Change Password" description="Manager you password">
                <button class="button secondary">Change Password</button>
            </SettingsItem>
            <SettingsItem
                title="Change Recovery Key"
                description="Manager you recovery key"
            >
                <button class="button secondary">Change Recovery Key</button>
            </SettingsItem>
        </SettingsGroup>
    );
}
