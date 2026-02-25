use crate::auth::fetch_user;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Mutex;
use tauri::{command, State};
use tauri_plugin_stronghold::stronghold::Stronghold;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConnectionType {
    Online,
    Offline,
}

pub struct AccountData {
    pub user: Option<Value>,
    pub connection: Option<ConnectionType>,
}

#[derive(Serialize)]
pub struct SignInStatus {
    pub state: bool,
    #[serde(rename = "type")]
    pub kind: Option<ConnectionType>,
}

#[command]
pub async fn get_user(
    stronghold: State<'_, Stronghold>,
    state: State<'_, Mutex<AccountData>>,
) -> Result<Value, String> {
    {
        let account_state = state.lock().unwrap();
        if let Some(user) = &account_state.user {
            return Ok(user.clone());
        }
    }
    let is_online = fetch_user(stronghold, state.clone())
        .await
        .map_err(|e| e.to_string())?;
    let mut account_state = state.lock().unwrap();
    if let Some(user) = account_state.user.clone() {
        account_state.connection = Some(if is_online {
            ConnectionType::Online
        } else {
            ConnectionType::Offline
        });
        Ok(user)
    } else {
        Err("User is None after fetch".into())
    }
}

/// Returns `{ state: bool, type: "online" | "offline" | null }`.
///
/// - `state: false` → no user is loaded in memory.
/// - `state: true, type: "online"`  → last fetch came from the network.
/// - `state: true, type: "offline"` → last fetch fell back to the local backup.
///
/// The connection type is set by `get_user` based on what `fetch_user` reported,
/// so call `get_user` at least once before `is_signed_in` for an accurate result.
#[command]
pub async fn is_signed_in(state: State<'_, Mutex<AccountData>>) -> Result<SignInStatus, String> {
    let has_user = {
        let app_data = state.lock().unwrap();
        app_data.user.is_some()
    };

    if !has_user {
        return Ok(SignInStatus {
            state: false,
            kind: None,
        });
    }

    let connection = {
        let account_data = state.lock().unwrap();
        account_data.connection.clone()
    };

    Ok(SignInStatus {
        state: true,
        kind: connection,
    })
}

/// Signs the user out by removing tokens and the backup user from the stronghold,
/// and clearing the user from AppData and AccountData.
#[command]
pub async fn sign_out(
    stronghold: State<'_, Stronghold>,
    state: State<'_, Mutex<AccountData>>,
) -> Result<(), String> {
    // Remove tokens — ignore error if key didn't exist
    let _ = crate::stronghold::delete(&stronghold, "auth_client", b"tokens");
    // Remove cached backup user as well
    let _ = crate::stronghold::delete(&stronghold, "auth_client", b"backup_user");

    // Clear in-memory user state
    let mut account_data = state.lock().unwrap();
    {
        account_data.user = None;
    }
    {
        account_data.user = None;
        account_data.connection = None;
    }

    Ok(())
}
