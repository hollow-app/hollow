use std::sync::Mutex;

use tauri_plugin_log::log::{self};

mod app;
mod plugins;
mod utils;
mod vault;

// use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let prevent = tauri_plugin_prevent_default::Builder::new()
        .with_flags(
            tauri_plugin_prevent_default::Flags::CONTEXT_MENU
                | tauri_plugin_prevent_default::Flags::PRINT
                | tauri_plugin_prevent_default::Flags::DOWNLOADS,
        )
        .build();

    tauri::Builder::default()
        // static
        .plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
            log::debug!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
        }))
        // relative
        .manage(Mutex::new(app::AppData {
            realm_location: None,
        }))
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            #[cfg(any(windows, target_os = "linux"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register_all()?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_tcp::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(prevent)
        .invoke_handler(tauri::generate_handler![
            app::start_realm,
            app::reload,
            app::get_version,
            app::get_platform,
            utils::create_dir,
            utils::read_file,
            utils::first_launch,
            plugins::get_unsigned_plugins,
            plugins::add_plugin,
            plugins::remove_plugin,
            vault::vault_add,
            vault::vault_remove,
            vault::vault_add_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
