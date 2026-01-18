// use reqwest::Url;
// use tauri::AppHandle;
// use tauri_plugin_deep_link::DeepLinkExt;
// use tauri_plugin_log::log;

// use crate::auth;

// pub fn setup_deeplink_handler(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
//     #[cfg(any(windows, target_os = "linux"))]
//     {
//         app.deep_link().register_all()?;
//     }
//
//     let app_handle = app.handle().clone();
//     app.deep_link().on_open_url(move |event| {
//         for parsed_url in event.urls() {
//             handle_deeplink(&app_handle, &parsed_url);
//         }
//     });
//
//     Ok(())
// }
//
// fn handle_deeplink(app_handle: &AppHandle, url: &Url) {
//     if url.scheme() != "hollow" {
//         return;
//     }
//
//     match url.host_str() {
//         Some("auth") => handle_auth_deeplink(app_handle, url),
//         _ => {
//             log::warn!("Unknown deeplink host: {:?}", url.host_str());
//         }
//     }
// }
//
// fn handle_auth_deeplink(_app_handle: &AppHandle, url: &Url) {
//     match url.path() {
//         "/user" => {
//             // handle_auth_user_deeplink(app_handle, url),
//             log::warn!("Too Soon: {}", url.path());
//         }
//         _ => {
//             log::warn!("Unknown auth deeplink path: {}", url.path());
//         }
//     }
// }

// fn handle_auth_user_deeplink(app_handle: &AppHandle, url: &Url) {
//     let Some((_, code)) = url.query_pairs().find(|(key, _)| key == "code") else {
//         log::error!("Missing 'code' parameter in auth deeplink");
//         return;
//     };
//
//     let verify = url
//         .query_pairs()
//         .any(|(key, value)| key == "verify" && value == "true");
//
//     let app_handle_clone = app_handle.clone();
//     let code_str = code.to_string();
//
//     tauri::async_runtime::spawn(async move {
//         let Some(stronghold_plugin) =
//             app_handle_clone.try_state::<tauri_plugin_stronghold::stronghold::Stronghold>()
//         else {
//             log::error!("Stronghold state not available");
//             return;
//         };
//
//         if let Err(e) = auth::auth_user(stronghold_plugin.inner(), code_str, verify).await {
//             log::error!("Failed to authenticate user: {}", e);
//         } else {
//             log::info!("User authenticated successfully");
//         }
//     });
// }
