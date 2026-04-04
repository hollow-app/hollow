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

async fn get_current_realm_id(app: AppHandle) -> Result<Option<String>, String> {
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
pub async fn get_current_realm(app: AppHandle) -> Result<Option<serde_json::Value>, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?;

    let store_path = config_dir.join("realms.json");

    let store = app
        .store(store_path)
        .map_err(|e| format!("Failed to load store: {}", e))?;

    let current_id = store
        .get("current")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    let realms = store.get("realms").and_then(|v| v.as_array().cloned());

    let current_realm = match (current_id, realms) {
        (Some(id), Some(realms)) => realms
            .iter()
            .find(|r| r.get("id").and_then(|v| v.as_str()) == Some(&id))
            .cloned(),
        _ => None,
    };

    Ok(current_realm)
}

#[tauri::command]
pub async fn has_realm_selected(app: AppHandle) -> Result<bool, String> {
    let current = get_current_realm_id(app).await?;
    Ok(current.is_some())
}

pub async fn open_window(app: AppHandle) -> Result<(), String> {
    use tauri_plugin_log::log;

    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?;

    let store_path = config_dir.join("realms.json");
    let store = app
        .store(store_path)
        .map_err(|e| format!("Failed to load store: {}", e))?;
    store
        .reload()
        .map_err(|e| format!("Failed to reload store: {}", e))?;

    let select_on_startup: bool = store
        .get("selectOnStartup")
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
            tauri::WebviewUrl::App("layers/index.html".into()),
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
        tauri::WebviewUrl::App("layers/selector.html".into()),
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
            tauri::WebviewUrl::App("layers/index.html".into()),
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
// ops
#[tauri::command]
pub async fn add_realm(app: AppHandle, realm: serde_json::Value) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;

    let store_path = config_dir.join("realms.json");
    let store = app.store(store_path).map_err(|e| e.to_string())?;

    let mut realms = store
        .get("realms")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();

    realms.push(realm);

    store.set("realms", serde_json::json!(realms));
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}
#[tauri::command]
pub async fn remove_realm(app: AppHandle, id: String) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let store_path = config_dir.join("realms.json");
    let store = app.store(store_path).map_err(|e| e.to_string())?;

    let mut realms = store
        .get("realms")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();

    realms.retain(|r| r.get("id").and_then(|v| v.as_str()) != Some(&id));

    let current = store
        .get("current")
        .and_then(|v| v.as_str().map(|s| s.to_string()));

    if current.as_ref() == Some(&id) {
        store.set("current", serde_json::Value::Null);
    }

    store.set("realms", serde_json::json!(realms));
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}
#[tauri::command]
pub async fn update_realm(app: AppHandle, updated_realm: serde_json::Value) -> Result<(), String> {
    let id = updated_realm
        .get("id")
        .and_then(|v| v.as_str())
        .ok_or("Realm must have an id")?;

    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let store_path = config_dir.join("realms.json");
    let store = app.store(store_path).map_err(|e| e.to_string())?;

    let mut realms = store
        .get("realms")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();

    for realm in realms.iter_mut() {
        if realm.get("id").and_then(|v| v.as_str()) == Some(id) {
            *realm = updated_realm.clone();
        }
    }

    store.set("realms", serde_json::json!(realms));
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}
#[tauri::command]
pub async fn select_realm(app: AppHandle, id: String) -> Result<(), String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let store_path = config_dir.join("realms.json");
    let store = app.store(store_path).map_err(|e| e.to_string())?;

    store.set("current", serde_json::json!(id));
    store.save().map_err(|e| e.to_string())?;

    Ok(())
}
#[tauri::command]
pub async fn toggle_select_realm_on_startup(app: AppHandle) -> Result<bool, String> {
    let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    let store_path = config_dir.join("realms.json");
    let store = app.store(store_path).map_err(|e| e.to_string())?;

    let current = store
        .get("selectOnStartup")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let new_value = !current;

    store.set("selectOnStartup", serde_json::json!(new_value));
    store.save().map_err(|e| e.to_string())?;

    Ok(new_value)
}
#[tauri::command]
pub async fn get_realms(app: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?;

    let store_path = config_dir.join("realms.json");
    let store = app
        .store(store_path)
        .map_err(|e| format!("Failed to load store: {}", e))?;

    // Fetch the "realms" array from the store
    let realms = store
        .get("realms")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();

    Ok(realms)
}
#[tauri::command]
pub async fn get_realms_config(app: AppHandle) -> Result<RealmStorage, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?;

    let store_path = config_dir.join("realms.json");
    let store = app
        .store(store_path)
        .map_err(|e| format!("Failed to load store: {}", e))?;

    let realms_config: RealmStorage = RealmStorage {
        current: store
            .get("current")
            .and_then(|v| v.as_str().map(|s| s.to_string())),
        realms: store
            .get("realms")
            .and_then(|v| v.as_array().cloned())
            .unwrap_or_default(),
        select_on_startup: store
            .get("selectOnStartup")
            .and_then(|v| v.as_bool())
            .unwrap_or(false),
    };

    Ok(realms_config)
}
#[tauri::command]
pub async fn update_realms_config(
    app: AppHandle,
    new_data: serde_json::Value,
) -> Result<(), String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?;

    let store_path = config_dir.join("realms.json");

    let store = app
        .store(store_path)
        .map_err(|e| format!("Failed to load store: {}", e))?;

    store.clear();

    if let Some(obj) = new_data.as_object() {
        for (key, value) in obj {
            store.set(key.clone(), value.clone());
        }
    } else {
        return Err("Provided data is not a valid JSON object".to_string());
    }

    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(())
}
