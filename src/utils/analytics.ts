import mixpanel from "mixpanel-browser";

// Configuration: Replace with your Mixpanel token
const MIXPANEL_TOKEN = "956a268906f11fda7d1152264a026056";

// Key used to store anonymous user ID locally
const USER_ID_KEY = "hollow_user_id";

// Default opt-in state
let analyticsEnabled = false;

/**
 * Initialize Mixpanel
 */
export function initAnalytics(optIn: boolean) {
	analyticsEnabled = optIn;

	mixpanel.init(MIXPANEL_TOKEN, {
		autocapture: false,
		autotrack: false,
		record_sessions_percent: 0,
		api_host: "https://api-eu.mixpanel.com",
		disable_cookie: true,
		disable_persistence: true,
		debug: false,
		ip: false,
		opt_out_tracking_by_default: !optIn,
	});

	// Generate or retrieve a persistent anonymous user ID
	let userId = localStorage.getItem(USER_ID_KEY);
	if (!userId) {
		userId = crypto.randomUUID();
		localStorage.setItem(USER_ID_KEY, userId);
	}

	mixpanel.identify(userId);

	// Track first app launch if analytics is enabled
	if (analyticsEnabled) {
		trackEvent("app_opened");
	}
}

/**
 * Manually track an event
 * @param eventName - Name of the event
 * @param properties - Optional additional properties
 */
export function trackEvent(
	eventName: string,
	properties?: Record<string, any>,
) {
	if (!analyticsEnabled) return;
	mixpanel.track(eventName, properties || {});
}

/**
 * Toggle analytics at runtime
 */
export function setAnalyticsEnabled(enabled: boolean) {
	analyticsEnabled = enabled;
	mixpanel.set_config({ opt_out_tracking_by_default: !enabled });

	// Optionally track enabling analytics
	if (enabled) {
		trackEvent("analytics_enabled");
	} else {
		trackEvent("analytics_disabled");
	}
}

/**
 * Get anonymous user ID
 */
export function getUserId(): string {
	let userId = localStorage.getItem(USER_ID_KEY);
	if (!userId) {
		userId = crypto.randomUUID();
		localStorage.setItem(USER_ID_KEY, userId);
	}
	return userId;
}
