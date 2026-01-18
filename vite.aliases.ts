import path from "path";

export const aliases = {
	hollow: path.resolve(__dirname, "src/App/hollow.ts"),
	"@app": path.resolve(__dirname, "src/App/app"),
	"@utils": path.resolve(__dirname, "src/App/utils"),
	"@coretools": path.resolve(__dirname, "src/App/(Core Tools)"),
	"@assets": path.resolve(__dirname, "src/App/assets"),
	"@components": path.resolve(__dirname, "src/App/components"),
	"@managers": path.resolve(__dirname, "src/App/managers"),
	"@hooks": path.resolve(__dirname, "src/App/hooks"),
	"@services": path.resolve(__dirname, "src/App/services"),
	"@styles": path.resolve(__dirname, "src/App/styles"),
	"@type": path.resolve(__dirname, "src/App/type"),
	"@context": path.resolve(__dirname, "src/App/context"),
	"@store": path.resolve(__dirname, "src/store"),
	"@rust": path.resolve(__dirname, "src/lib/rust.ts"),
};
