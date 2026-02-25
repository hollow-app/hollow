use std::sync::Mutex;

use reqwest::Url;
use tauri::AppHandle;
use tauri::Manager;
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_log::log;

use crate::auth;
use crate::auth::AuthData;

/// Sets up the deep link handler for the application.
///
/// This specific function registers the deep link scheme (e.g., `hollow://`)
/// and sets up a global listener to handle incoming URLs.
///
/// On Windows and Linux, explicit registration via `register_all()` is required.
/// On macOS, this is typically handled by the bundle configuration.

pub fn setup_deeplink_handler(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(any(windows, target_os = "linux"))]
    {
        use tauri_plugin_deep_link::DeepLinkExt;
        app.deep_link().register_all()?;
    }

    let app_handle = app.handle().clone();
    app.deep_link().on_open_url(move |event| {
        for parsed_url in event.urls() {
            handle_deeplink(&app_handle, &parsed_url);
        }
    });

    Ok(())
}

/// Central dispatcher for handling incoming deep link URLs.
///
/// It verifies that the URL scheme matches "hollow" and then routes
/// the request based on the host segment (e.g., `auth`).
fn handle_deeplink(app_handle: &AppHandle, url: &Url) {
    if url.scheme() != "hollow" {
        return;
    }

    match url.host_str() {
        Some("auth") => handle_auth_deeplink(app_handle, url),
        _ => {
            log::warn!("Unknown deeplink host: {:?}", url.host_str());
        }
    }
}

/// Specialized handler for authentication-related deep links.
///
/// Expected format: `hollow://auth/<path>`
/// Currently handles routing for the `/user` path.
fn handle_auth_deeplink(app_handle: &AppHandle, url: &Url) {
    match url.path() {
        "/callback" => {
            // Flow : Sign in #2
            handle_auth_callback_deeplink(app_handle, url);
            log::warn!("Too Soon: {}", url.path());
        }
        _ => {
            log::warn!("Unknown auth deeplink path: {}", url.path());
        }
    }
}

/// Processes the user authentication callback.
///
/// Expected format: `hollow://auth/user?code=<code_val>&verify=<bool>`
///
/// It extracts the `code` and optional `verify` parameters from the query string
/// and spawns an asynchronous task to authenticate the user against the backend
/// using the Stronghold plugin for secure state management.
fn handle_auth_callback_deeplink(app_handle: &AppHandle, url: &Url) {
    let Some((_, signature)) = url.query_pairs().find(|(key, _)| key == "signature") else {
        log::error!("Missing 'signature' parameter in auth deeplink");
        return;
    };
    let Some(auth_state) = app_handle.try_state::<Mutex<AuthData>>() else {
        log::error!("AuthData state not available");
        return;
    };
    let mut auth_data = auth_state.lock().unwrap();
    let Some(stored_signature) = auth_data.signature.take() else {
        log::error!("No stored signature found in AuthData");
        return;
    };
    if stored_signature != signature {
        log::error!(
            "Signature mismatch! Expected: {}, Received: {}",
            stored_signature,
            signature
        );
        return;
    }
    log::info!("Signature verified successfully");
    let Some((_, code)) = url.query_pairs().find(|(key, _)| key == "loginCode") else {
        log::error!("Missing 'code' parameter in auth deeplink");
        return;
    };
    let app_handle_clone = app_handle.clone();
    let code_str = code.to_string();
    tauri::async_runtime::spawn(async move {
        let Some(stronghold_plugin) =
            app_handle_clone.try_state::<tauri_plugin_stronghold::stronghold::Stronghold>()
        else {
            log::error!("Stronghold state not available");
            return;
        };
        if let Err(e) = auth::auth_callback(stronghold_plugin.inner(), code_str).await {
            log::error!("Failed to authenticate user: {}", e);
        } else {
            log::info!("User authenticated successfully");
        }
    });
}
