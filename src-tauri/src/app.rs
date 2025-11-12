use std::sync::Mutex;
use tauri::{command, AppHandle, Manager, State};
use tauri_plugin_log::log::{self};

use crate::utils::{create_dir_internal, get_full_path};

#[derive(Default, Debug)]
pub struct AppData {
    pub realm_location: Option<String>,
}

#[command]
pub fn start_realm(
    location: String,
    state: State<'_, Mutex<AppData>>,
    app: AppHandle,
) -> Result<(), String> {
    {
        let mut app_data = state.lock().unwrap();
        app_data.realm_location = Some(location);
    }

    let dot_dir = get_full_path(".hollow", &state)?;
    if !dot_dir.exists() {
        create_dir_internal(".hollow", &state)?;
        create_dir_internal("vault", &state)?;
        create_dir_internal("plugins", &state)?;
    }
    {
        let assets_scope = app.asset_protocol_scope();
        let vault_dir = get_full_path("vault", &state)?;
        let _ = assets_scope.allow_directory(vault_dir, false);
    }

    log::info!("Initialized realm data");
    Ok(())
}

#[command]
pub fn reload(app: AppHandle) -> Result<(), String> {
    crate::utils::get_main_window(&app)?
        .reload()
        .map_err(|e| format!("Failed to reload window: {}", e))
}

#[command]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[command]
pub fn get_platform() -> String {
    std::env::consts::OS.to_string()
}
