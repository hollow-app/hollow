/**
 * Represents a notification that can be displayed in Hollow.
 */
export type NotifyType = {
	/**
	 * A unique identifier for the notification.
	 */
	id: string;

	/**
	 * Title of the notification.
	 */
	title: string;

	/**
	 * Main message content of the notification.
	 */
	message: string;

	/**
	 * Optional attachment URL or identifier.
	 */
	attachment?: string;

	/**
	 * ISO timestamp of when the notification was submitted.
	 */
	submitted_at: string;

	/**
	 * ISO timestamp of when the notification should expire.
	 */
	expires_at?: string;

	banner?: string;

	platform?: "macos" | "linux" | "windows" | "all";
};
