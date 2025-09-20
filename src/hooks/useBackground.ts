import { Property } from "@type/Property";
import setStyle from "./setStyle";

export function useBackground(pack: {
        name?: string;
        data?: string;
        opacity?: string;
}) {
        const key = `${window.realmManager.currentRealmId}-canvas-bg`;
        const savedData = localStorage.getItem(key);

        const vars: Property[] = [];

        if (pack.data || pack.opacity) {
                pack.data &&
                        vars.push({
                                name: "--canvas-bg-image",
                                value: pack.data,
                        });
                pack.opacity &&
                        vars.push({
                                name: "--canvas-bg-opacity",
                                value: pack.opacity,
                        });
                const parsedData = JSON.parse(savedData);
                localStorage.setItem(
                        key,
                        JSON.stringify({
                                ...parsedData,
                                ...pack,
                        }),
                );
        } else if (savedData) {
                const parsedData = JSON.parse(savedData);
                vars.push({
                        name: "--canvas-bg-image",
                        value: parsedData.data,
                });
                vars.push({
                        name: "--canvas-bg-opacity",
                        value: parsedData.opacity,
                });
        } else {
                localStorage.setItem(
                        key,
                        JSON.stringify({
                                data: 'url("")',
                                opacity: "0.5",
                                name: null,
                        }),
                );
                vars.push({
                        name: "--canvas-bg-image",
                        value: 'url("")',
                });
                vars.push({
                        name: "--canvas-bg-opacity",
                        value: "0.5",
                });
        }
        setStyle(vars);
}
