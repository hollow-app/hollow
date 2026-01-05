import { manager } from "@managers/index";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function guide() {
	try {
		const driverObj = driver({
			animate: true,
			showProgress: true,
			allowClose: true,
			showButtons: ["close"],
			doneBtnText: "Done",
			overlayClickBehavior: () => {},
			steps: [
				{
					element: "#expand-btn",
					popover: {
						title: "Expand Panel",
						description:
							"This opens the left panel where you create cards. Click this now to continue.",
						side: "right",
					},
					onHighlightStarted: () => {
						const interval = setInterval(() => {
							if (document.getElementById("new-card-btn")) {
								clearInterval(interval);
								driverObj.moveNext();
							}
						}, 400);
					},
				},
				{
					element: "#new-card-btn",
					popover: {
						title: "Create a Card",
						description:
							"Click here to create a new card. Cards are instances of tools that you place into your workspace.",
						side: "bottom",
						showButtons: ["next"],
						onNextClick: () => {
							if (document.getElementById("form-0")) {
								driverObj.moveNext();
							}
						},
					},
					onHighlightStarted: (element: Element) => {
						if (!element) return;
						element.addEventListener(
							"click",
							() => {
								const interval = setInterval(() => {
									if (document.getElementById("form-0")) {
										clearInterval(interval);
										driverObj.moveNext();
									}
								}, 200);
							},
							{ once: true },
						);
					},
				},
				{
					element: "#form-0",
					popover: {
						title: "Card Setup",
						description:
							"Here you choose the tool type, card name, and emoji. These define what the card is and how it appears.",
						side: "right",
						showButtons: ["next"],
					},
				},
				{
					element: () => lastByClass("drop-down"),
					popover: {
						title: "Choose a Tool",
						description:
							"Click here to open the list of available tools.",
						side: "right",
						showButtons: ["next"],
						onNextClick: () => {
							if (lastByClass("drop-down-list")) {
								driverObj.moveNext();
							}
						},
					},
					onHighlightStarted: (element: Element) => {
						if (!element) return;
						element.addEventListener(
							"click",
							() => {
								const interval = setInterval(() => {
									if (lastByClass("drop-down-list")) {
										clearInterval(interval);
										driverObj.moveNext();
									}
								}, 200);
							},
							{ once: true },
						);
					},
				},
				{
					element: () => lastByClass("drop-down-list"),
					popover: {
						title: "Tool List",
						description:
							"Pick the tool this card will be based on.",
						side: "right",
						showButtons: ["next"],
					},
					onHighlightStarted: () => driverObj.moveNext(),
				},
				{
					element: () => lastByClass("option-input"),
					popover: {
						title: "Card Name",
						description:
							"Type the name of this card. This is how it will appear in Hollow.",
						side: "right",
						showButtons: ["next"],
						onNextClick: (el: HTMLInputElement) => {
							if (el.value) {
								driverObj.moveNext();
							}
						},
					},
				},
				{
					element: () => lastByClass("option-emoji"),
					popover: {
						title: "Choose an Emoji",
						description:
							"Click to select an emoji that visually represents this card.",
						side: "right",
						showButtons: ["next"],
						onNextClick: () => {
							if (lastByClass("emoji-picker")) {
								driverObj.moveNext();
							}
						},
					},
					onHighlightStarted: (element: Element) => {
						if (!element) return;
						element.addEventListener(
							"click",
							() => {
								const interval = setInterval(() => {
									if (lastByClass("emoji-picker")) {
										clearInterval(interval);
										driverObj.moveNext();
									}
								}, 200);
							},
							{ once: true },
						);
					},
				},
				{
					element: () => lastByClass("emoji-picker"),
					popover: {
						title: "Emoji Picker",
						description:
							"Choose an emoji that best matches this tool.",
						side: "right",
						showButtons: ["next"],
						onNextClick: () => {
							if (!lastByClass("emoji-picker")) {
								driverObj.moveNext();
							}
						},
					},
					onHighlightStarted: (element: Element) => {
						if (!element) return;
						element.addEventListener(
							"click",
							() => {
								const interval = setInterval(() => {
									if (!lastByClass("emoji-picker")) {
										clearInterval(interval);
										driverObj.moveNext();
									}
								}, 200);
							},
							{ once: true },
						);
					},
				},
				{
					element: () => lastByClass("form-submit"),
					popover: {
						title: "Create Card",
						description:
							"Click here to create the card and add it to your workspace.",
						side: "right",
						showButtons: ["next"],
						onNextClick: () => {
							if (!lastByClass("form-submit")) {
								driverObj.moveNext();
							}
						},
					},
					onHighlightStarted: (element: Element) => {
						if (!element) return;
						element.addEventListener(
							"click",
							() => {
								const interval = setInterval(() => {
									if (!lastByClass("form-submit")) {
										clearInterval(interval);
										driverObj.moveNext();
									}
								}, 200);
							},
							{ once: true },
						);
					},
				},
				{
					element: () => lastByClass("card-config"),
					popover: {
						title: "Card Controls",
						description:
							"This item lets you manage this card. You can change its emoji, favorite it, delete it, or place it into the canvas.",
						side: "right",
						showButtons: ["next"],
					},
				},
				{
					element: () => lastByClass("card-config-place"),
					popover: {
						title: "Place Card",
						description:
							"Click this to place the card into your workspace so it becomes usable.",
						side: "right",
						showButtons: ["next"],
						onNextClick: () => {
							if (lastByClass("grid-stack-item")) {
								driverObj.moveNext();
							}
						},
					},
					onHighlightStarted: (element: Element) => {
						if (!element) return;
						element.addEventListener(
							"click",
							() => {
								const interval = setInterval(() => {
									if (lastByClass("grid-stack-item")) {
										clearInterval(interval);
										driverObj.moveNext();
									}
								}, 200);
							},
							{ once: true },
						);
					},
				},
				{
					element: () => lastByClass("grid-stack-item"),
					popover: {
						title: "Tool Instance",
						description:
							"This card is a tool instance. Each instance is an independent copy of a tool, meaning you can create as many as you want and configure each one differently. Right-click this card to continue.",
						side: "bottom",
						showButtons: ["next"],
						onNextClick: () => {
							if (document.querySelector(".context-menu")) {
								driverObj.moveNext();
							}
						},
					},
					onHighlightStarted: (element: Element) => {
						if (!element) return;
						element.addEventListener(
							"contextmenu",
							() => {
								const interval = setInterval(() => {
									if (
										document.querySelector(".context-menu")
									) {
										clearInterval(interval);
										driverObj.moveNext();
									}
								}, 200);
							},
							{ once: true },
						);
					},
				},
				{
					element: () => lastByClass("context-menu"),
					popover: {
						title: "Context Menu",
						description:
							"This is where you will find option related to this card, most notible the 'Modify' which is for chaning the look and 'Configure' for the settings of this card, click Next to continue.",
						side: "right",
						showButtons: ["next"],
					},
				},
				{
					element: "#canvas-editor-btn",
					popover: {
						title: "Canvas Editor",
						description:
							"This lets you move, resize, and position cards directly in the canvas. Turn it on to arrange your workspace.",
						side: "right",
						showButtons: ["next"],
					},
				},
				{
					element: "#editor-btn",
					popover: {
						title: "Editor Panel",
						description:
							"This opens the tool editor. You can also open this by right-clicking a card and choosing Modify.",
						side: "right",
					},
					onHighlightStarted: () => {
						const interval = setInterval(() => {
							if (document.getElementById("editor-panel")) {
								clearInterval(interval);
								driverObj.moveNext();
							}
						}, 100);
					},
				},
				{
					element: "#editor-panel",
					popover: {
						title: "Tool & Card Selection",
						description:
							"The first dropdown selects a tool. The second selects which placed card instance you are editing. All styling and behavior options are controlled here.",
						side: "left",
						showButtons: ["next"],
					},
				},
				{
					popover: {
						title: "Advanced Styling",
						description:
							"For advanced users, more styling options can be added in $RealmLocation/.hollow/main.json. Editing this file can affect stability, so be cautious.",
						showButtons: ["next"],
					},
				},
				{
					element: "#vault-btn",
					popover: {
						title: "Vault",
						description:
							"The Vault is where you manage images and icons used across Hollow. Open it now.",
						side: "right",
					},
					onHighlightStarted: () => {
						const interval = setInterval(() => {
							if (
								document.getElementById("vault-import-url-btn")
							) {
								clearInterval(interval);
								driverObj.moveNext();
							}
						}, 100);
					},
				},
				{
					element: "#vault-import-url-btn",
					popover: {
						title: "Import from URL",
						description:
							"Use this to import images directly from a web link.",
						side: "right",
						showButtons: ["next"],
					},
				},
				{
					element: "#vault-import-local-btn",
					popover: {
						title: "Import Local Files",
						description:
							"Use this to import images and files from your computer.",
						side: "right",
						showButtons: ["next"],
					},
				},
				{
					popover: {
						title: "How the Vault Works",
						description:
							"Imported files are stored in #RealmLocation/vault. Only files listed in #RealmLocation/.hollow/vault.json are actually registered and usable in Hollow.",
						showButtons: ["next"],
					},
				},
				{
					popover: {
						title: "Welcome to Hollow",
						description:
							"This is your space to build, customize, and organize your tools exactly the way you want. You’ve completed the quick tour, now you can start shaping your workspace. Enjoy ❤️",
					},
				},
			],
		});

		driverObj.drive();
	} catch (e) {
		console.log("failed driver tour");
	}
}
function lastByClass(className: string): HTMLElement | null {
	const list = document.getElementsByClassName(className);
	return list.length ? (list[list.length - 1] as HTMLElement) : null;
}
