use serde_json::Value;
use std::{fs, sync::Mutex};
use tauri::{command, State};

use crate::utils::get_full_path;

#[command]
pub fn add_plugin(
    plugin_name: String,
    content: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<bool, String> {
    let plugin_file = get_full_path("plugins", &state)?
        .join(&plugin_name)
        .join("index.js");

    if let Some(parent) = plugin_file.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {}", e))?;
    }

    fs::write(&plugin_file, &content).map_err(|e| format!("Failed to write file: {}", e))?;
    Ok(true)
}

#[command]
pub fn get_unsigned_plugins(
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<Vec<Value>, String> {
    let plugin_dir = get_full_path("plugins", &state)?;
    let mut unsigned_tools = Vec::new();

    for entry in
        fs::read_dir(&plugin_dir).map_err(|e| format!("Failed to read plugin directory: {}", e))?
    {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        let manifest_path = path.join("manifest.json");

        if manifest_path.exists() {
            let content = fs::read_to_string(&manifest_path)
                .map_err(|e| format!("Failed to read manifest: {}", e))?;
            let manifest: Value = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse manifest JSON: {}", e))?;
            unsigned_tools.push(manifest);
        }
    }

    Ok(unsigned_tools)
}

#[command]
pub fn remove_plugin(
    name: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<bool, String> {
    let plugin_dir = get_full_path("plugins", &state)?.join(&name);
    if plugin_dir.exists() {
        fs::remove_dir_all(&plugin_dir)
            .map_err(|e| format!("Failed to remove plugin directory: {}", e))?;
    }
    Ok(true)
}
