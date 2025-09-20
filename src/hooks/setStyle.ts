import { Property } from "@type/Property";

export default function setStyle(properties: Property[]) {
        let styleTag = document.getElementById(
                "dynamic-styles",
        ) as HTMLStyleElement;

        let cssContent = styleTag.textContent.slice(0, -1);

        properties.forEach(({ name }) => {
                const regex = new RegExp(`\\s*${name}:\\s*[^;]+;`, "g");
                cssContent = cssContent.replace(regex, "");
        });

        styleTag.textContent =
                cssContent +
                properties.map((i) => `${i.name}: ${i.value};`).join("\n") +
                "\n}";
}
