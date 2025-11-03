export class SettingsManager {
	private static self: SettingsManager;

	static getSelf() {
		if (!this.self) {
			this.self = new SettingsManager();
		}
		return this.self;
	}

	async start() {}
}
