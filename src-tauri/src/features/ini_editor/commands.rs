use super::model::{GameClient, IniFilesResponse, OpenIniResponse};
use crate::state::IniEditorState;
use tauri::State;

#[tauri::command]
pub async fn load_ini_files(state: State<'_, IniEditorState>) -> Result<IniFilesResponse, String> {
    state.lock().await.list_ini_files().map_err(String::from)
}

#[tauri::command]
pub async fn open_ini(
    state: State<'_, IniEditorState>,
    client: GameClient,
    filename: String,
) -> Result<OpenIniResponse, String> {
    state.lock().await.open_ini(client, &filename).map_err(String::from)
}

#[tauri::command]
pub async fn save_section(
    state: State<'_, IniEditorState>,
    section: String,
    updates: Vec<(String, String)>,
) -> Result<(), String> {
    state.lock().await.save_section(&section, updates).map_err(String::from)
}

#[tauri::command]
pub async fn apply_audio_presets(state: State<'_, IniEditorState>) -> Result<(), String> {
    state.lock().await.apply_audio_presets().map_err(String::from)
}

#[tauri::command]
pub async fn get_config_path(state: State<'_, IniEditorState>) -> Result<String, String> {
    Ok(state.lock().await.config_folder_path())
}
