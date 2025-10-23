import setStyle from "@hooks/setStyle";
import { useBackground } from "@hooks/useBackground";
import useCodeTheme from "@hooks/useCodeTheme";
import { useColor } from "@hooks/useColor";
import useTags from "@hooks/useTags";
import { DataBaseRequest, EntryType } from "@type/hollow";
import { EntryManager } from "./EntryManager";
import { hotkeysManager } from "./HotkeysManager";
import { MarkdownManager } from "./MarkdownManager";
import { NotifyManager } from "./NotifyManager";
import { ToolManager } from "./ToolManager";
import { RustManager } from "@managers/RustManager";
import { CharacterManager } from "./CharacterManager";
import VaultManager from "./VaultManager";
import Tool from "@components/Tool";
import { ToolDataBase } from "./ToolDataBase";

export async function initialization1() {
	await VaultManager.getSelf().start();
	await CharacterManager.getSelf().start();
	// await new Promise((resolve) => setTimeout(resolve, 5_000));
	return true;
}

export async function initialization2() {
	if (!localStorage.platform) {
		localStorage.platform = await RustManager.getSelf().get_platform();
	}
	const devData = handleDev();
	window.toolManager = await ToolManager.create(devData.loadunsigned);
	window.entryManager = EntryManager.getSelf();
	await window.entryManager.start();
	useColor({ name: "primary" });
	useColor({ name: "secondary" });
	setStyle([
		{
			name: "--static-grid-lines",
			value: JSON.parse(
				localStorage.getItem(
					`${window.realmManager.currentRealmId}-static-grid-lines`,
				) ?? "false",
			)
				? "var(--secondary-color-15)"
				: "transparent",
		},
	]);
	useBackground({});
	useTags();
	window.markdownManager = new MarkdownManager();
	useCodeTheme();
	window.hotkeysManager = new hotkeysManager();
	NotifyManager.init();
	handleEvents();
}

function handleEvents() {
	window.hollowManager.on("send-entry", (entry: EntryType) =>
		window.entryManager.receiveEntry(entry),
	);
	window.hollowManager.on("remove-entry", (id: string) =>
		window.entryManager.removeEntry(id),
	);

	// returns Promise
	window.hollowManager.on(
		"render-markdown",
		({ id, text }: { id: string; text: string }) =>
			window.markdownManager.renderMarkdown(text, id),
	);
	window.hollowManager.on("database", (request: DataBaseRequest) => {
		const {
			pluginName,
			version = 1,
			stores = [{ name: "cards" }],
			callback,
		} = request;

		const pluginDB = new ToolDataBase(pluginName, version, stores);

		callback(pluginDB);
	});
}

function handleDev() {
	const key = `${window.realmManager.currentRealmId}-dev`;
	const savedData: string | undefined = localStorage.getItem(key);
	let iniData = {
		devtools: false,
		loadunsigned: false,
	};

	if (savedData) {
		const parsedData: { devtools: boolean; loadunsigned: boolean } =
			JSON.parse(savedData);
		// parsedData.devtools &&
		//         RustManager.getSelf().devtools_status({ state: true });
		iniData = parsedData;
	} else {
		localStorage.setItem(key, JSON.stringify(iniData));
	}
	return iniData;
}
