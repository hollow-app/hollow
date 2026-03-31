use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Mutex;
use tauri::{command, State, Url};
use tauri_plugin_opener::open_url;
use tauri_plugin_stronghold::stronghold::Stronghold;
use uuid::Uuid;

use crate::account::AccountData;

#[derive(Default, Debug)]
pub struct AuthData {
    pub signature: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Tokens {
    pub access: String,
    pub refresh: String,
}

pub async fn load_tokens(stronghold: State<'_, Stronghold>) -> Result<Tokens, String> {
    let data = crate::stronghold::get(&stronghold, "auth_client", "tokens".as_bytes())?
        .ok_or("No tokens")?;
    serde_json::from_slice(&data).map_err(|e| e.to_string())
}

pub fn save_backup_user_internal(stronghold: &Stronghold, user: &Value) -> Result<(), String> {
    let json = serde_json::to_string(user).map_err(|e| e.to_string())?;

    crate::stronghold::set(
        stronghold,
        "auth_client",
        "backup_user".as_bytes(),
        json.as_bytes(),
    )
}

fn load_backup_user_internal(stronghold: &Stronghold) -> Result<Value, String> {
    let data = crate::stronghold::get(stronghold, "auth_client", "backup_user".as_bytes())?
        .ok_or("No backup user")?;

    serde_json::from_slice(&data).map_err(|e| e.to_string())
}

// SignIn logic moved to TypeScript

// TODO should be called upon internet connection
#[command]
pub async fn fetch_user(
    stronghold: State<'_, Stronghold>,
    state: State<'_, Mutex<AccountData>>,
) -> Result<bool, String> {
    // Returns true if the user was fetched from the network (online),
    // false if it fell back to the local backup (offline).
    let tokens = match load_tokens(stronghold.clone()).await {
        Ok(t) => t,
        Err(_) => {
            let backup = load_backup_user_internal(&stronghold);
            let mut account_data = state.lock().unwrap();
            account_data.user = backup.ok();
            return Ok(false);
        }
    };

    let url = if cfg!(debug_assertions) {
        "http://localhost:8787/initialize"
    } else {
        "https://hollow.ryusufe.workers.dev/initialize"
    };
    let payload = serde_json::json!({
        "access": tokens.access,
        "refresh": tokens.refresh
    });
    let client = reqwest::Client::new();
    let resp = match client.post(url).json(&payload).send().await {
        Ok(r) => r,
        Err(_) => {
            let backup = load_backup_user_internal(&stronghold);
            let mut account_data = state.lock().unwrap();
            account_data.user = backup.ok();
            return Ok(false);
        }
    };

    if !resp.status().is_success() {
        let backup = load_backup_user_internal(&stronghold);
        let mut account_data = state.lock().unwrap();
        account_data.user = backup.ok();
        return Ok(false);
    }

    let user: Value = match resp.json().await {
        Ok(u) => u,
        Err(_) => {
            let backup = load_backup_user_internal(&stronghold);
            let mut account_data = state.lock().unwrap();
            account_data.user = backup.ok();
            return Ok(false);
        }
    };

    if let Some(new_access) = user.get("access").and_then(|v| v.as_str()) {
        let updated_tokens = Tokens {
            access: new_access.to_string(),
            refresh: tokens.refresh.clone(),
        };

        if let Ok(json) = serde_json::to_string(&updated_tokens) {
            if let Err(e) =
                crate::stronghold::set(&stronghold, "auth_client", b"tokens", json.as_bytes())
            {
                eprintln!("Failed to update tokens in stronghold: {e}");
            }
        }
    }

    {
        let mut account_data = state.lock().unwrap();
        account_data.user = Some(user.clone());
    }

    let _ = save_backup_user_internal(&stronghold, &user);

    Ok(true)
}

// Flow : Sign in #3
pub async fn auth_callback(stronghold: &Stronghold, code: String) -> Result<(), String> {
    let url = if cfg!(debug_assertions) {
        "http://localhost:8787/auth/login-code"
    } else {
        "https://hollow.ryusufe.workers.dev/auth/login-code"
    };

    let body = serde_json::json!({
        "loginCode": code
    });

    let resp = reqwest::Client::new()
        .post(url)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !resp.status().is_success() {
        return Err("Auth failed".into());
    }

    let json: Value = resp.json().await.map_err(|e| e.to_string())?;
    let access = json["access"]
        .as_str()
        .ok_or("Missing access token")?
        .to_string();
    let refresh = json["refresh"]
        .as_str()
        .ok_or("Missing refresh token")?
        .to_string();

    let tokens = Tokens { access, refresh };

    let json = serde_json::to_string(&tokens).map_err(|e| e.to_string())?;

    crate::stronghold::set(
        stronghold,
        "auth_client",
        "tokens".as_bytes(),
        json.as_bytes(),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn build_auth_url(signature: &String) -> Result<String, String> {
    let base = if cfg!(debug_assertions) {
        "http://localhost:3000/auth/app"
    } else {
        "https://hollowapp.pages.dev/auth/app"
    };
    let mut url = Url::parse(base).map_err(|e| e.to_string())?;
    url.query_pairs_mut()
        .append_pair("client_id", "desktop")
        .append_pair("redirect_uri", "hollow://auth/callback")
        .append_pair("response_type", "token")
        .append_pair("scope", "user")
        .append_pair("signature", &signature);
    Ok(url.to_string())
}
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
