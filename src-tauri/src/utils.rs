use crate::app::AppData;
use std::{fs, path::PathBuf, sync::Mutex};
use tauri::{command, AppHandle, Manager, State};
use tauri_plugin_log::log::{self};

pub fn validate_path(path: &str) -> Result<(), String> {
    let p = std::path::Path::new(path);
    if p.is_absolute() {
        return Err("Path must be relative".to_string());
    }
    for component in p.components() {
        if matches!(component, std::path::Component::ParentDir) {
            return Err("Path traversal is not allowed".to_string());
        }
    }
    Ok(())
}

pub fn get_full_path(path: &str, state: &State<'_, Mutex<AppData>>) -> Result<PathBuf, String> {
    let app_data = state.lock().unwrap();
    let base = app_data
        .realm_location
        .as_ref()
        .ok_or("Realm location not initialized yet")?;
    Ok(PathBuf::from(base).join(path))
}

pub fn create_dir_internal(path: &str, state: &State<'_, Mutex<AppData>>) -> Result<(), String> {
    validate_path(path)?;
    let full_path = get_full_path(path, state)?;
    if !full_path.exists() {
        fs::create_dir_all(&full_path).map_err(|e| e.to_string())?;
        log::info!("Directory created: {}", full_path.display());
    }
    // else {
    //     log::info!("Directory already exists: {}", full_path.display());
    // }
    Ok(())
}

// Commands
#[command]
pub fn first_launch(app: AppHandle) {
    let app_config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Could not get app data directory: {}", e))
        .unwrap();
    if !app_config_dir.exists() {
        let _ = fs::create_dir_all(&app_config_dir).map_err(|e| e.to_string());
        log::info!("Directory created: {}", app_config_dir.display());
    } else {
        log::info!("Directory already exists: {}", app_config_dir.display());
    }
}
#[command]
pub fn create_dir(paths: Vec<String>, state: State<'_, Mutex<AppData>>) -> Result<(), String> {
    for path in paths {
        create_dir_internal(&path, &state)?
    }
    Ok(())
}

#[command]
pub fn read_file(path: String, state: State<'_, Mutex<AppData>>) -> Result<String, String> {
    validate_path(&path)?;
    let file_path = get_full_path(&path, &state)?;
    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }
    Ok(fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))?)
}
