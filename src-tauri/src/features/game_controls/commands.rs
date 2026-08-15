use super::model::GameInfo;
use super::service::GameControlsService;
use tauri::State;

#[tauri::command]
pub async fn game_info(state: State<'_, GameControlsService>) -> Result<GameInfo, String> {
    state.game_info().await.map_err(String::from)
}

#[tauri::command]
pub async fn start_game(state: State<'_, GameControlsService>) -> Result<(), String> {
    state.start_game().await.map_err(String::from)
}

#[tauri::command]
pub async fn close_game(state: State<'_, GameControlsService>) -> Result<(), String> {
    state.close_game().await.map_err(String::from)
}

#[tauri::command]
pub async fn restart_game(state: State<'_, GameControlsService>) -> Result<(), String> {
    state.restart_game().await.map_err(String::from)
}
