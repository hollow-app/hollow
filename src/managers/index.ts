import { CardFileManager } from "./CardFileManager";
import { CharacterManager } from "./CharacterManager";
import { CodeThemeManager } from "./CodeThemeManager";
import { DeepLinkManager } from "./DeepLinkManager";
import { HollowManager } from "./HollowManager";
import { hotkeysManager } from "./HotkeysManager";
import { MarkdownManager } from "./MarkdownManager";
import { NotifyManager } from "./NotifyManager";
import { RealmManager } from "./RealmManager";
import { RustManager } from "./RustManager";
import { SettingsManager } from "./SettingsManager";
import VaultManager from "./VaultManager";

const realm = new RealmManager();
const rust = new RustManager();
const deeplink = new DeepLinkManager();
const character = new CharacterManager();
const hotkeys = new hotkeysManager();
const markdown = new MarkdownManager();
const settings = new SettingsManager();
const vault = new VaultManager();
const notify = new NotifyManager();
const codeTheme = new CodeThemeManager();
const cardfile = new CardFileManager();
const hollow = new HollowManager();

export const manager = {
	deeplink,
	cardfile,
	character,
	codeTheme,
	hollow,
	hotkeys,
	markdown,
	notify,
	realm,
	rust,
	settings,
	vault,
};
