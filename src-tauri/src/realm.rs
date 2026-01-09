use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use tauri_plugin_store::StoreExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct RealmStorage {
    pub current: Option<String>,
    pub realms: Vec<serde_json::Value>,
    #[serde(default)]
    pub select_on_startup: bool,
}

impl Default for RealmStorage {
    fn default() -> Self {
        Self {
            current: None,
            realms: Vec::new(),
            select_on_startup: false,
        }
    }
}

#[tauri::command]
pub async fn get_current_realm_id(app: AppHandle) -> Result<Option<String>, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?;

    let store_path = config_dir.join("realms.json");

    let store = app
        .store(store_path)
        .map_err(|e| format!("Failed to load store: {}", e))?;

    let current = store
        .get("current")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    Ok(current)
}

#[tauri::command]
pub async fn has_realm_selected(app: AppHandle) -> Result<bool, String> {
    let current = get_current_realm_id(app).await?;
    Ok(current.is_some())
}

pub async fn check_and_open_window(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_log::log;

    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?;

    let store_path = config_dir.join("realms.json");
    let store = app
        .store(store_path)
        .map_err(|e| format!("Failed to load store: {}", e))?;

    let select_on_startup: bool = store
        .get("select_on_startup")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    log::info!("select_on_startup = {}", select_on_startup);

    if select_on_startup {
        log::info!("select_on_startup is true, opening selector window");
        return open_realm_selector(app).await;
    }

    let has_realm = has_realm_selected(app.clone()).await?;
    log::info!("Checking realm status: has_realm = {}", has_realm);

    if has_realm {
        log::info!("Opening main window with index.html");

        let builder = tauri::webview::WebviewWindowBuilder::new(
            &app,
            "main",
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("hollow")
        .decorations(false)
        .maximized(true)
        .inner_size(800.0, 600.0);

        builder
            .build()
            .map_err(|e| format!("Failed to create main window: {}", e))?;
    } else {
        log::info!("Opening selector window");

        open_realm_selector(app).await?;
    }

    Ok(())
}

#[tauri::command]
pub async fn open_realm_selector(app: AppHandle) -> Result<(), String> {
    use tauri::Manager;
    use tauri_plugin_log::log;

    if let Some(window) = app.get_webview_window("selector") {
        log::info!("Selector window already exists, focusing it");
        window
            .set_focus()
            .map_err(|e| format!("Failed to focus selector window: {}", e))?;
        return Ok(());
    }

    log::info!("Creating new selector window with selector.html");

    let builder = tauri::webview::WebviewWindowBuilder::new(
        &app,
        "selector",
        tauri::WebviewUrl::App("selector.html".into()),
    )
    .title("Select Realm")
    .center()
    .inner_size(900.0, 700.0)
    .resizable(false)
    .decorations(false)
    .visible(true);

    let window = builder
        .build()
        .map_err(|e| format!("Failed to create selector window: {}", e))?;

    log::info!(
        "Selector window created successfully with label: {}",
        window.label()
    );

    Ok(())
}

#[tauri::command]
pub async fn open_main_window(app: AppHandle) -> Result<(), String> {
    use tauri::Manager;

    if let Some(window) = app.get_webview_window("main") {
        window
            .eval("window.location.reload()")
            .map_err(|e| format!("Failed to reload main window: {}", e))?;
    } else {
        let builder = tauri::webview::WebviewWindowBuilder::new(
            &app,
            "main",
            tauri::WebviewUrl::App("index.html".into()),
        )
        .title("hollow")
        .decorations(false)
        .maximized(true)
        .inner_size(800.0, 600.0);

        builder
            .build()
            .map_err(|e| format!("Failed to create main window: {}", e))?;
    }

    Ok(())
}
