import { render, template } from "solid-js/web";

export function importImage() {
        return new Promise((resolve, reject) => {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = "image/*";

                fileInput.onchange = (event) => {
                        const file = (event.target as HTMLInputElement)
                                .files?.[0];
                        if (file) {
                                const reader = new FileReader();

                                reader.onloadend = () => {
                                        resolve(reader.result as string);
                                        fileInput.remove();
                                };

                                reader.onerror = (error) => {
                                        reject(error);
                                        fileInput.remove();
                                };
                                reader.readAsDataURL(file);
                        } else {
                                reject(new Error("No file selected"));
                                fileInput.remove();
                        }
                };

                fileInput.click();
        });
}

export const handleOptionFile = (e: any, option: any) => {
        const file = e.currentTarget.files?.[0];
        if (!file) return;

        const fileNameDisplay = e.target.closest("div")?.querySelector("span");
        if (fileNameDisplay) fileNameDisplay.textContent = file.name;

        //const isImage = option.accept?.includes("image");
        //const isText = option.accept?.includes("text");

        //if (isImage || isText) {
        //        const reader = new FileReader();
        //        reader.onload = () => {
        //                option.onChange(reader.result as string);
        //        };
        //        if (isImage) reader.readAsDataURL(file);
        //        if (isText) reader.readAsText(file);
        //} else {
        option.onChange(file);
        //}
};
