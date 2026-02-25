use argon2::{
    password_hash::{PasswordHasher, SaltString},
    Argon2, Params,
};
use tauri::{App, Manager};
use tauri_plugin_stronghold::stronghold::Stronghold;

use crate::utils::get_or_create_password;

pub fn init(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let stronghold_password = get_or_create_password("stronghold-key")?;

    let stronghold_path = app
        .handle()
        .path()
        .app_local_data_dir()
        .expect("could not resolve app local data path");

    if !stronghold_path.exists() {
        std::fs::create_dir_all(&stronghold_path).expect("failed to create app data dir");
    }

    let stronghold_path = stronghold_path.join("hollow.stronghold");
    let salt = SaltString::encode_b64(b"hollow-stronghold-salt-v1").expect("failed to create salt");
    let params = Params::new(10_000, 4, 1, Some(32)).expect("failed to create argon2 params");
    let argon2 = Argon2::new(argon2::Algorithm::Argon2id, argon2::Version::V0x13, params);
    let password_hash = argon2
        .hash_password(stronghold_password.as_bytes(), &salt)
        .expect("failed to hash password");
    let hash = password_hash.hash.expect("hash missing");
    let password_key = hash.as_bytes().to_vec();
    let stronghold =
        Stronghold::new(stronghold_path, password_key).expect("failed to create stronghold");
    app.handle().manage(stronghold);
    Ok(())
}

pub fn set(
    stronghold: &Stronghold,
    client_name: &str,
    key: &[u8],
    value: &[u8],
) -> Result<(), String> {
    let client = match stronghold.get_client(client_name) {
        Ok(c) => c,
        Err(_) => match stronghold.load_client(client_name) {
            Ok(c) => c,
            Err(_) => stronghold
                .create_client(client_name)
                .map_err(|e| e.to_string())?,
        },
    };

    let store = client.store();
    store
        .insert(key.to_vec(), value.to_vec(), None)
        .map_err(|e| e.to_string())?;

    stronghold.save().map_err(|e| e.to_string())?;

    Ok(())
}

pub fn get(
    stronghold: &Stronghold,
    client_name: &str,
    key: &[u8],
) -> Result<Option<Vec<u8>>, String> {
    let client = match stronghold.get_client(client_name) {
        Ok(c) => c,
        Err(_) => match stronghold.load_client(client_name) {
            Ok(c) => c,
            Err(_) => stronghold
                .create_client(client_name)
                .map_err(|e| e.to_string())?,
        },
    };

    let store = client.store();
    store.get(key).map_err(|e| e.to_string())
}

pub fn delete(stronghold: &Stronghold, client_name: &str, key: &[u8]) -> Result<(), String> {
    let client = match stronghold.get_client(client_name) {
        Ok(c) => c,
        Err(_) => match stronghold.load_client(client_name) {
            Ok(c) => c,
            Err(_) => stronghold
                .create_client(client_name)
                .map_err(|e| e.to_string())?,
        },
    };

    let store = client.store();
    store.delete(key).map_err(|e| e.to_string())?;

    stronghold.save().map_err(|e| e.to_string())?;

    Ok(())
}
