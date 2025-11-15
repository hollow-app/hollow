use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::{command, State};
use tauri_plugin_log::log::{self};
use uuid::Uuid;

use crate::utils::get_full_path;

#[command]
pub fn vault_add(
    paths: Vec<String>,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<Vec<PathBuf>, String> {
    let vault_dir = get_full_path("vault", &state)?;
    let mut added_files = Vec::new();

    for path in paths {
        let source_path = Path::new(&path);

        let id = Uuid::new_v4().to_string();

        let extension = source_path
            .extension()
            .and_then(|s| s.to_str())
            .unwrap_or("");
        let new_file_name = if extension.is_empty() {
            id.clone()
        } else {
            format!("{}.{}", id, extension)
        };

        let dest_path = vault_dir.join(&new_file_name);

        if let Err(e) = fs::copy(&source_path, &dest_path) {
            log::error!("Could not copy {}: {}", path, e);
            continue;
        }

        log::info!("Copied {} to {}", path, dest_path.display());

        added_files.push(dest_path.clone());
    }

    Ok(added_files)
}

#[command]
pub fn vault_remove(
    names: Vec<String>,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<(), String> {
    let vault_dir = get_full_path("vault", &state)?;
    let mut had_errors = false;

    for name in names {
        let file_path = vault_dir.join(&name);

        if file_path.exists() {
            if let Err(e) = fs::remove_file(&file_path) {
                log::error!("Could not remove {}: {}", name, e);
                had_errors = true;
            } else {
                log::info!("Removed file: {}", file_path.display());
            }
        } else {
            log::error!("File does not exist in vault: {}", name);
            had_errors = true;
        }
    }

    if had_errors {
        Err("Some files could not be removed. Check logs.".into())
    } else {
        Ok(())
    }
}
