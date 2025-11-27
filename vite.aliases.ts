import path from "path";

export const aliases = {
	hollow: path.resolve(__dirname, "src/hollow.ts"),
	"@app": path.resolve(__dirname, "src/app"),
	"@utils": path.resolve(__dirname, "src/utils"),
	"@coretools": path.resolve(__dirname, "src/(Core Tools)"),
	"@assets": path.resolve(__dirname, "src/assets"),
	"@components": path.resolve(__dirname, "src/components"),
	"@managers": path.resolve(__dirname, "src/managers"),
	"@hooks": path.resolve(__dirname, "src/hooks"),
	"@services": path.resolve(__dirname, "src/services"),
	"@styles": path.resolve(__dirname, "src/styles"),
	"@type": path.resolve(__dirname, "src/type"),
};
