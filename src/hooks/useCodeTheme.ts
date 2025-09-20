import {} from "highlight.js";

export default function useCodeTheme(name?: string) {
        const key = `${window.realmManager.currentRealmId}-code-theme`;
        const theme = name ?? localStorage.getItem(key) ?? "github-dark";
        localStorage.setItem(key, theme);

        const themeEl = document.getElementById(
                "code-theme",
        ) as HTMLLinkElement;
        // themeEl.href = `/src/renderer/styles/highlightjs-themes/${theme}.css`;
        themeEl.href = new URL(
                `../styles/highlightjs-themes/${theme}.css`,
                import.meta.url,
        ).href;
}
