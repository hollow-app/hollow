use std::sync::Mutex;
use tauri_plugin_log::log::{self};

mod app;
mod auth;
mod cards;
mod deeplink;
mod plugins;
mod realm;
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
        // .plugin(tauri_plugin_stronghold::Builder::new(|_pass| todo!()).build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        // static
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            log::debug!("a new app instance was opened with {argv:?}");
            // When another instance is detected, always open selector for new realm
            let app_handle = app.clone();
            tauri::async_runtime::spawn(async move {
                let _ = realm::open_realm_selector(app_handle).await;
            });
        }))
        // relative
        .manage(Mutex::new(app::AppData {
            realm_location: None,
        }))
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            // let salt_path = app
            //     .path()
            //     .app_local_data_dir()
            //     .expect("could not resolve app local data path")
            //     .join("stronghold_salt");
            //     app.handle().plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;

            deeplink::setup_deeplink_handler(app)?;

            // Check if current realm is set
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match realm::check_and_open_window(app_handle).await {
                    Ok(_) => log::info!("Window opened based on realm check"),
                    Err(e) => log::error!("Failed to check realm: {}", e),
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_tcp::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(prevent)
        .invoke_handler(tauri::generate_handler![
            app::start_realm,
            //app::reload,
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
            // auth::get_user,
            // auth::update_user_character,
            cards::card_read_dir,
            cards::card_read_file,
            cards::card_write_file,
            cards::card_remove,
            cards::card_exists,
            cards::card_mkdir,
            cards::card_rename,
            realm::get_current_realm_id,
            realm::has_realm_selected,
            realm::open_realm_selector,
            realm::open_main_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
