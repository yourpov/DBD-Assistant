use super::model::{
    Archive, CatalogEntry, DataVersion, DlcEntry, GameEvent, GameMode, Journal, KillswitchEntry, PatchNotes,
    PlayerFullStats, PlayerLookup, Rift, ShrineRotation, TopStatEntry,
};
use super::service::DbdDataService;
use tauri::State;

#[tauri::command]
pub async fn get_shrine(state: State<'_, DbdDataService>) -> Result<ShrineRotation, String> {
    state.shrine().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_latest_patch_notes(state: State<'_, DbdDataService>) -> Result<PatchNotes, String> {
    state.latest_patch_notes().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_player_count(state: State<'_, DbdDataService>) -> Result<u32, String> {
    state.player_count().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_player_full_stats(
    state: State<'_, DbdDataService>,
    steam_id: String,
) -> Result<Option<PlayerFullStats>, String> {
    state.player_full_stats(&steam_id).await.map_err(String::from)
}

#[tauri::command]
pub async fn get_player_lookup(state: State<'_, DbdDataService>, steam_id: String) -> Result<PlayerLookup, String> {
    state.player_lookup(&steam_id).await.map_err(String::from)
}

#[tauri::command]
pub async fn get_dlc(state: State<'_, DbdDataService>) -> Result<Vec<DlcEntry>, String> {
    state.dlc().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_events(state: State<'_, DbdDataService>) -> Result<Vec<GameEvent>, String> {
    state.events().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_gamemodes(state: State<'_, DbdDataService>) -> Result<Vec<GameMode>, String> {
    state.gamemodes().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_killswitch(state: State<'_, DbdDataService>) -> Result<Vec<KillswitchEntry>, String> {
    state.killswitch().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_data_versions(state: State<'_, DbdDataService>) -> Result<Vec<DataVersion>, String> {
    state.data_versions().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_rank_reset(state: State<'_, DbdDataService>) -> Result<i64, String> {
    state.rank_reset().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_top_stats(state: State<'_, DbdDataService>, stat: String) -> Result<Vec<TopStatEntry>, String> {
    state.top_stats(&stat).await.map_err(String::from)
}

#[tauri::command]
pub async fn get_characters(state: State<'_, DbdDataService>) -> Result<Vec<CatalogEntry>, String> {
    state.characters().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_perks(state: State<'_, DbdDataService>) -> Result<Vec<CatalogEntry>, String> {
    state.perks().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_maps(state: State<'_, DbdDataService>) -> Result<Vec<CatalogEntry>, String> {
    state.maps().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_offerings(state: State<'_, DbdDataService>) -> Result<Vec<CatalogEntry>, String> {
    state.offerings().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_items(state: State<'_, DbdDataService>) -> Result<Vec<CatalogEntry>, String> {
    state.items().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_addons(state: State<'_, DbdDataService>) -> Result<Vec<CatalogEntry>, String> {
    state.addons().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_archives(state: State<'_, DbdDataService>) -> Result<Vec<Archive>, String> {
    state.archives().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_journals(state: State<'_, DbdDataService>) -> Result<Vec<Journal>, String> {
    state.journals().await.map_err(String::from)
}

#[tauri::command]
pub async fn get_rift(state: State<'_, DbdDataService>) -> Result<Vec<Rift>, String> {
    state.rift().await.map_err(String::from)
}
