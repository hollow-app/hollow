use serde_json::Value;
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};
use tauri_plugin_prevent_default::Flags;

fn get_data_path(app: &AppHandle, subfolder: &str) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Could not get app data directory: {}", e))?
        .join(subfolder);

    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create {} directory: {}", subfolder, e))?;
    }

    Ok(dir)
}

fn get_main_window(app: &AppHandle) -> Result<tauri::WebviewWindow, String> {
    app.get_webview_window("main")
        .ok_or("Main window not found".to_string())
}

#[tauri::command]
fn reload(app: AppHandle) -> Result<(), String> {
    get_main_window(&app)?
        .reload()
        .map_err(|e| format!("Failed to reload window: {}", e))?;
    Ok(())
}

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

#[tauri::command]
fn get_unsigned_tools(app: AppHandle) -> Result<Vec<Value>, String> {
    let plugin_dir = get_data_path(&app, "plugins")?;
    let mut unsigned_tools = Vec::new();

    let entries =
        fs::read_dir(&plugin_dir).map_err(|e| format!("Failed to read plugin directory: {}", e))?;

    for entry in entries {
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

#[tauri::command]
fn create_plugin_directory(app: AppHandle, name: String) -> Result<bool, String> {
    let plugin_dir = get_data_path(&app, "plugins")?.join(&name);

    if !plugin_dir.exists() {
        fs::create_dir_all(&plugin_dir)
            .map_err(|e| format!("Failed to create plugin directory: {}", e))?;
    }

    Ok(true)
}

#[tauri::command]
fn create_plugin_file(
    app: AppHandle,
    plugin_name: String,
    file_name: String,
    content: String,
) -> Result<bool, String> {
    let file_path = get_data_path(&app, "plugins")?
        .join(&plugin_name)
        .join(&file_name);

    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Failed to remove existing file: {}", e))?;
    }

    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {}", e))?;
    }

    fs::write(&file_path, &content).map_err(|e| format!("Failed to write file: {}", e))?;
    Ok(true)
}

#[tauri::command]
fn uninstall_plugin(app: AppHandle, name: String) -> Result<bool, String> {
    let plugin_dir = get_data_path(&app, "plugins")?.join(&name);

    if plugin_dir.exists() {
        fs::remove_dir_all(&plugin_dir)
            .map_err(|e| format!("Failed to remove plugin directory: {}", e))?;
    }

    Ok(true)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    let file_path = PathBuf::from(path);

    if !file_path.exists() {
        return Err("File does not exist".to_string());
    }

    let content =
        fs::read_to_string(&file_path).map_err(|e| format!("Failed to read file: {}", e))?;
    Ok(content)
}

#[tauri::command]
fn join(app: AppHandle, path: Vec<String>) -> Result<String, String> {
    let mut full_path = PathBuf::new();

    for p in path {
        if p == "user_plugins" {
            full_path.push(get_data_path(&app, "plugins")?);
        } else {
            full_path.push(p);
        }
    }

    Ok(full_path.to_string_lossy().to_string())
}

#[tauri::command]
fn open_directory(app: AppHandle, path: Vec<String>) -> Result<(), String> {
    let mut full_path = PathBuf::new();

    for p in path {
        if p == "user_plugins" {
            full_path.push(get_data_path(&app, "plugins")?);
        } else {
            full_path.push(p);
        }
    }

    if !full_path.exists() {
        return Err("Directory does not exist".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&full_path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&full_path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&full_path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
fn vault_add(app: AppHandle, source: String, name: String) -> Result<PathBuf, String> {
    let vault_dir = get_data_path(&app, "vault")?;

    let dest_path = vault_dir.join(&name);

    // copy file only if it doesn't exist yet
    if !dest_path.exists() {
        fs::copy(&source, &dest_path)
            .map_err(|e| format!("Could not copy {}: {}", source, e))?;
    }

    Ok(dest_path)
}

#[tauri::command]
fn vault_remove(app: AppHandle, name: String) -> Result<(), String> {
    let vault_dir = get_data_path(&app, "vault")?;
    let file_path = vault_dir.join(&name);

    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Could not remove {}: {}", name, e))?;
    } else {
        return Err(format!("File {} does not exist in vault", name));
    }

    Ok(())
}

#[tauri::command]
fn vault_rename(app: AppHandle, name: String, new_name: String) -> Result<PathBuf, String> {
    let vault_dir = get_data_path(&app, "vault")?;
    let old_path = vault_dir.join(&name);
    let new_path = vault_dir.join(&new_name);

    if !old_path.exists() {
        return Err(format!("File {} does not exist in vault", name));
    }

    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Could not rename {}: {}", name, e))?;

    Ok(new_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let prevent = tauri_plugin_prevent_default::Builder::new()
        .with_flags(Flags::CONTEXT_MENU | Flags::PRINT | Flags::DOWNLOADS)
        .build();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(prevent)
        .invoke_handler(tauri::generate_handler![
            reload,
            get_version,
            get_platform,
            get_unsigned_tools,
            create_plugin_directory,
            create_plugin_file,
            uninstall_plugin,
            join,
            open_directory,
            vault_add,
            vault_remove,
            vault_rename,
            read_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
