import path from "path";

export const aliases = {
	hollow: path.resolve(__dirname, "src/hollow.ts"),
	"@app": path.resolve(__dirname, "src/App"),
	"@overlays": path.resolve(__dirname, "src/overlays"),
	"@coretools": path.resolve(__dirname, "src/App/(Core Tools)"),
	"@assets": path.resolve(__dirname, "src/assets"),
	"@styles": path.resolve(__dirname, "src/styles"),
	"@shared": path.resolve(__dirname, "src/shared"),
	"@store": path.resolve(__dirname, "src/shared/store"),
	"@rust": path.resolve(__dirname, "src/lib/rust.ts"),
	"@lib": path.resolve(__dirname, "src/lib"),
	"@ui": path.resolve(__dirname, "src/components/ui"),
	"@component": path.resolve(__dirname, "src/components"),
	"@hollow/center": "/home/ryu/hub/hollow-center/src/index.ts"
            

};
