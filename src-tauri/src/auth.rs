// use serde::{Deserialize, Serialize};
// use serde_json::Value;
// use tauri::State;
// use tauri_plugin_stronghold::stronghold::Stronghold;
//
// #[derive(Serialize, Deserialize, Clone)]
// pub struct Tokens {
//     pub access: String,
//     pub refresh: String,
// }
//
// pub async fn load_tokens(stronghold: State<'_, Stronghold>) -> Result<Tokens, String> {
//     let client = stronghold
//         .get_client("auth_client")
//         .map_err(|e| e.to_string())?;
//     let store = client.store();
//
//     let data = store
//         .get("tokens".as_bytes())
//         .map_err(|e| e.to_string())?
//         .ok_or("No tokens")?;
//
//     serde_json::from_slice(&data).map_err(|e| e.to_string())
// }
//
// fn save_backup_user_internal(stronghold: &Stronghold, user: &Value) -> Result<(), String> {
//     let client = stronghold
//         .get_client("auth_client")
//         .map_err(|e| e.to_string())?;
//     let store = client.store();
//     let json = serde_json::to_string(user).map_err(|e| e.to_string())?;
//
//     store
//         .insert("backup_user".as_bytes().to_vec(), json.into_bytes(), None)
//         .map_err(|e| e.to_string())?;
//     Ok(())
// }
//
// fn load_backup_user_internal(stronghold: &Stronghold) -> Result<Value, String> {
//     let client = stronghold
//         .get_client("auth_client")
//         .map_err(|e| e.to_string())?;
//     let store = client.store();
//     let data = store
//         .get("backup_user".as_bytes())
//         .map_err(|e| e.to_string())?
//         .ok_or("No backup user")?;
//
//     serde_json::from_slice(&data).map_err(|e| e.to_string())
// }
//
// #[tauri::command]
// pub async fn get_user(stronghold: State<'_, Stronghold>) -> Result<Value, String> {
//     let tokens = match load_tokens(stronghold.clone()).await {
//         Ok(t) => t,
//         Err(_) => return load_backup_user_internal(&stronghold),
//     };
//
//     let url = if cfg!(debug_assertions) {
//         "http://localhost:8787/initialize"
//     } else {
//         "https://hollow.ryusufe.workers.dev/initialize"
//     };
//
//     let client = reqwest::Client::new();
//     let resp = client
//         .get(url)
//         .json(&serde_json::json!({ "access": &tokens.access }))
//         .send()
//         .await
//         .map_err(|_| "Network error")?;
//
//     if !resp.status().is_success() {
//         return load_backup_user_internal(&stronghold);
//     }
//
//     let user: Value = resp.json().await.map_err(|e| e.to_string())?;
//
//     if let Some(new_access) = user.get("access").and_then(|v| v.as_str()) {
//         let updated_tokens = Tokens {
//             access: new_access.to_string(),
//             refresh: tokens.refresh.clone(),
//         };
//         let client = stronghold
//             .get_client("auth_client")
//             .map_err(|e| e.to_string())?;
//         let store = client.store();
//         let json = serde_json::to_string(&updated_tokens).map_err(|e| e.to_string())?;
//         store
//             .insert("tokens".as_bytes().to_vec(), json.into_bytes(), None)
//             .map_err(|e| e.to_string())?;
//     }
//
//     save_backup_user_internal(&stronghold, &user)?;
//     Ok(user)
// }
//
// pub async fn auth_user(stronghold: &Stronghold, code: String, verify: bool) -> Result<(), String> {
//     let url = if cfg!(debug_assertions) {
//         "http://localhost:8787/auth/login-code"
//     } else {
//         "https://hollow.ryusufe.workers.dev/auth/login-code"
//     };
//
//     let mut body = serde_json::json!({
//         "code": code
//     });
//
//     if verify {
//         body["verify"] = serde_json::json!(true);
//     }
//
//     let resp = reqwest::Client::new()
//         .post(url)
//         .json(&body)
//         .send()
//         .await
//         .map_err(|e| e.to_string())?;
//
//     if !resp.status().is_success() {
//         return Err("Auth failed".into());
//     }
//
//     let json: Value = resp.json().await.map_err(|e| e.to_string())?;
//     let access = json["access"]
//         .as_str()
//         .ok_or("Missing access token")?
//         .to_string();
//     let refresh = json["refresh"]
//         .as_str()
//         .ok_or("Missing refresh token")?
//         .to_string();
//
//     let tokens = Tokens { access, refresh };
//
//     let client = stronghold
//         .get_client("auth_client")
//         .map_err(|e| e.to_string())?;
//     let store = client.store();
//     let json = serde_json::to_string(&tokens).map_err(|e| e.to_string())?;
//
//     store
//         .insert("tokens".as_bytes().to_vec(), json.into_bytes(), None)
//         .map_err(|e| e.to_string())?;
//
//     Ok(())
// }
//
// #[tauri::command]
// pub async fn update_user_character(
//     stronghold: State<'_, Stronghold>,
//     payload: Value,
// ) -> Result<(), String> {
//     let tokens = load_tokens(stronghold.clone()).await?;
//
//     let url = if cfg!(debug_assertions) {
//         "http://localhost:8787/update-character"
//     } else {
//         "https://hollow.ryusufe.workers.dev/update-character"
//     };
//
//     let client = reqwest::Client::new();
//     let resp = client
//         .post(url)
//         .json(&serde_json::json!({
//             "access": &tokens.access,
//             "character": &payload
//         }))
//         .send()
//         .await
//         .map_err(|e| e.to_string())?;
//
//     if !resp.status().is_success() {
//         return Err("Update failed".into());
//     }
//
//     let json: Value = resp.json().await.map_err(|e| e.to_string())?;
//
//     let updated_tokens = if let Some(new_access) = json.get("access").and_then(|v| v.as_str()) {
//         Tokens {
//             access: new_access.to_string(),
//             refresh: tokens.refresh.clone(),
//         }
//     } else {
//         tokens
//     };
//
//     let client = stronghold
//         .get_client("auth_client")
//         .map_err(|e| e.to_string())?;
//     let store = client.store();
//     let json_tokens = serde_json::to_string(&updated_tokens).map_err(|e| e.to_string())?;
//     store
//         .insert("tokens".as_bytes().to_vec(), json_tokens.into_bytes(), None)
//         .map_err(|e| e.to_string())?;
//
//     if let Ok(mut user) = load_backup_user_internal(&stronghold) {
//         user["character"] = payload;
//         save_backup_user_internal(&stronghold, &user)?;
//     }
//
//     Ok(())
// }
