use tauri::{command, State};
use tauri_plugin_stronghold::stronghold::Stronghold;

#[command]
pub async fn test_store_data(
    stronghold: State<'_, Stronghold>,
    key: String,
    value: String,
) -> Result<String, String> {
    crate::stronghold::set(&stronghold, "test_client", key.as_bytes(), value.as_bytes())?;
    Ok(format!("Successfully stored data with key: {}", key))
}

#[command]
pub async fn test_get_data(
    stronghold: State<'_, Stronghold>,
    key: String,
) -> Result<String, String> {
    let data = crate::stronghold::get(&stronghold, "test_client", key.as_bytes())?
        .ok_or_else(|| format!("No data found for key: {}", key))?;

    let val = String::from_utf8(data).map_err(|e| e.to_string())?;
    Ok(format!("Data: {}", val))
}
