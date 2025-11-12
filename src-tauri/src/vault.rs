use std::{fs, path::PathBuf, sync::Mutex};
use tauri::{command, State};

use crate::utils::get_full_path;

#[command]
pub fn vault_add(
    source: String,
    name: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<PathBuf, String> {
    let vault_dir = get_full_path("vault", &state)?;
    let dest_path = vault_dir.join(&name);

    if !dest_path.exists() {
        fs::copy(&source, &dest_path).map_err(|e| format!("Could not copy {}: {}", source, e))?;
    }

    Ok(dest_path)
}

#[command]
pub fn vault_remove(
    name: String,
    state: State<'_, Mutex<crate::app::AppData>>,
) -> Result<(), String> {
    let vault_dir = get_full_path("vault", &state)?;
    let file_path = vault_dir.join(&name);

    if file_path.exists() {
        fs::remove_file(&file_path).map_err(|e| format!("Could not remove {}: {}", name, e))?;
    } else {
        return Err(format!("File {} does not exist in vault", name));
    }

    Ok(())
}
