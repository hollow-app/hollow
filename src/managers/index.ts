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

type ManagerCtor<T> = (new () => T) | (new (managers: Managers) => T);

function createManager<T>(Ctor: ManagerCtor<T>, managers: Managers): T {
	return Ctor.length === 0
		? new (Ctor as new () => T)()
		: new (Ctor as new (m: Managers) => T)(managers);
}

export class Managers {
	readonly realm: RealmManager;
	readonly rust: RustManager;
	readonly deeplink: DeepLinkManager;
	readonly character: CharacterManager;
	readonly hotkeys: hotkeysManager;
	readonly markdown: MarkdownManager;
	readonly settings: SettingsManager;
	readonly vault: VaultManager;
	readonly notify: NotifyManager;
	readonly codeTheme: CodeThemeManager;
	readonly cardfile: CardFileManager;
	readonly hollow: HollowManager;

	constructor() {
		this.realm = createManager(RealmManager, this);
		this.rust = createManager(RustManager, this);
		this.deeplink = createManager(DeepLinkManager, this);
		this.character = createManager(CharacterManager, this);
		this.hotkeys = createManager(hotkeysManager, this);
		this.markdown = createManager(MarkdownManager, this);
		this.settings = createManager(SettingsManager, this);
		this.vault = createManager(VaultManager, this);
		this.notify = createManager(NotifyManager, this);
		this.codeTheme = createManager(CodeThemeManager, this);
		this.cardfile = createManager(CardFileManager, this);
		this.hollow = createManager(HollowManager, this);
	}
}

export const manager = new Managers();
