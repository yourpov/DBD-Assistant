use super::model::Region;
use super::service::RegionControlService;
use tauri::State;

#[tauri::command]
pub async fn list_regions(state: State<'_, RegionControlService>) -> Result<Vec<Region>, String> {
    state.list_regions().await.map_err(String::from)
}

#[tauri::command]
pub async fn set_blocked_regions(state: State<'_, RegionControlService>, codes: Vec<String>) -> Result<(), String> {
    state.set_blocked_regions(codes).await.map_err(String::from)
}
