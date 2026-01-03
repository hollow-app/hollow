use crate::utils::{get_full_path, validate_path};
use serde::Serialize;
use std::{fs, path::PathBuf, sync::Mutex};
use tauri::{command, State};
use tauri_plugin_log::log;

#[derive(Serialize)]
pub struct CardDirEntry {
    pub name: String,
    pub is_dir: bool,
}

fn resolve_card_path(
    tool_name: &str,
    card_name: &str,
    path: &str,
    state: &State<'_, Mutex<crate::app::AppData>>,
) -> Result<PathBuf, String> {
    validate_path(tool_name)?;
    validate_path(card_name)?;

    let path = path.trim_start_matches('/');

    // Allow empty path for the card root
    if !path.is_empty() {
        validate_path(path)?;
    }

    let realm_path = get_full_path("main", state)?;
    let full_path = realm_path.join(tool_name).join(card_name).join(path);

    Ok(full_path)
}

#[command]
pub fn card_read_dir(
    tool_name: String,
    card_name: String,
    path: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<Vec<CardDirEntry>, String> {
    let target_path = resolve_card_path(&tool_name, &card_name, &path, &state)?;

    let mut entries = Vec::new();
    if target_path.exists() {
        for entry in fs::read_dir(&target_path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let file_type = entry.file_type().map_err(|e| e.to_string())?;
            entries.push(CardDirEntry {
                name: entry.file_name().to_string_lossy().to_string(),
                is_dir: file_type.is_dir(),
            });
        }
    } else {
        log::warn!("Path does not exist: {}", target_path.display());
    }
    Ok(entries)
}

#[command]
pub fn card_read_file(
    tool_name: String,
    card_name: String,
    path: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<String, String> {
    let target_path = resolve_card_path(&tool_name, &card_name, &path, &state)?;
    fs::read_to_string(target_path).map_err(|e| e.to_string())
}

#[command]
pub fn card_write_file(
    tool_name: String,
    card_name: String,
    path: String,
    contents: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<(), String> {
    let target_path = resolve_card_path(&tool_name, &card_name, &path, &state)?;

    if let Some(parent) = target_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[command]
pub fn card_remove(
    tool_name: String,
    card_name: String,
    path: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<(), String> {
    let target_path = resolve_card_path(&tool_name, &card_name, &path, &state)?;

    if target_path.exists() {
        if target_path.is_dir() {
            fs::remove_dir_all(target_path).map_err(|e| e.to_string())?;
        } else {
            fs::remove_file(target_path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[command]
pub fn card_exists(
    tool_name: String,
    card_name: String,
    path: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<bool, String> {
    let target_path = resolve_card_path(&tool_name, &card_name, &path, &state)?;
    Ok(target_path.exists())
}

#[command]
pub fn card_mkdir(
    tool_name: String,
    card_name: String,
    path: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<(), String> {
    let target_path = resolve_card_path(&tool_name, &card_name, &path, &state)?;
    fs::create_dir_all(target_path).map_err(|e| e.to_string())
}

#[command]
pub fn card_rename(
    tool_name: String,
    card_name: String,
    path: String,
    new_path: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<(), String> {
    let old_target = resolve_card_path(&tool_name, &card_name, &path, &state)?;
    let new_target = resolve_card_path(&tool_name, &card_name, &new_path, &state)?;

    if let Some(parent) = new_target.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    fs::rename(old_target, new_target).map_err(|e| e.to_string())
}
