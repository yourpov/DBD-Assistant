pub mod error;
pub mod features;
pub mod infrastructure;
pub mod ports;
pub mod state;

use features::about::service::AboutService;
use features::dbd_data::service::DbdDataService;
use features::game_controls::service::GameControlsService;
use features::ini_editor::service::IniEditorService;
use features::region_control::service::RegionControlService;
use infrastructure::elevation::WindowsElevatedRunner;
use infrastructure::epic_manifest::WindowsEpicManifestReader;
use infrastructure::hosts_file::WindowsHostsFileStore;
use infrastructure::lanyard::LanyardClient;
use infrastructure::process::{SysinfoProcessMonitor, WindowsLauncher};
use infrastructure::region_status::DeadByQueueStatusProvider;
use infrastructure::steam_manifest::WindowsSteamManifestReader;
use infrastructure::tricky_api::TrickyApiClient;
use ports::{AppCreditProvider, DbdDataProvider, ElevatedRunner, GameManifestReader, HostsFileStore};
use state::IniEditorState;
use std::sync::Arc;
use tokio::sync::Mutex;

fn dbd_config_path() -> (String, String) {
    let local_app_data = std::env::var("LOCALAPPDATA").expect("LOCALAPPDATA is always set on Windows");
    let windows_path = format!(r"{local_app_data}\DeadByDaylight\Saved\Config\WindowsClient");
    let egs_path = format!(r"{local_app_data}\DeadByDaylight\Saved\Config\EGSClient");
    (windows_path, egs_path)
}

pub fn run() {
    let (windows_path, egs_path) = dbd_config_path();
    let ini_editor: IniEditorState = Arc::new(Mutex::new(IniEditorService::new(windows_path, egs_path)));

    let manifest_readers: Vec<Arc<dyn GameManifestReader>> =
        vec![Arc::new(WindowsEpicManifestReader), Arc::new(WindowsSteamManifestReader)];
    let game_controls =
        GameControlsService::new(Arc::new(SysinfoProcessMonitor), Arc::new(WindowsLauncher), manifest_readers);

    let elevated_runner: Arc<dyn ElevatedRunner> = Arc::new(WindowsElevatedRunner);
    let hosts_store: Arc<dyn HostsFileStore> = Arc::new(WindowsHostsFileStore::new(elevated_runner));
    let region_control = RegionControlService::new(Arc::new(DeadByQueueStatusProvider::new()), hosts_store);

    let dbd_data_provider: Arc<dyn DbdDataProvider> = Arc::new(TrickyApiClient::new());
    let dbd_data = DbdDataService::new(dbd_data_provider);

    let credit_provider: Arc<dyn AppCreditProvider> = Arc::new(LanyardClient::new());
    let about = AboutService::new(credit_provider);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(ini_editor)
        .manage(game_controls)
        .manage(region_control)
        .manage(dbd_data)
        .manage(about)
        .invoke_handler(tauri::generate_handler![
            features::ini_editor::commands::load_ini_files,
            features::ini_editor::commands::open_ini,
            features::ini_editor::commands::save_section,
            features::ini_editor::commands::apply_audio_presets,
            features::ini_editor::commands::get_config_path,
            features::game_controls::commands::game_info,
            features::game_controls::commands::start_game,
            features::game_controls::commands::close_game,
            features::game_controls::commands::restart_game,
            features::region_control::commands::list_regions,
            features::region_control::commands::set_blocked_regions,
            features::dbd_data::commands::get_shrine,
            features::dbd_data::commands::get_latest_patch_notes,
            features::dbd_data::commands::get_player_count,
            features::dbd_data::commands::get_player_lookup,
            features::dbd_data::commands::get_player_full_stats,
            features::dbd_data::commands::get_dlc,
            features::dbd_data::commands::get_events,
            features::dbd_data::commands::get_gamemodes,
            features::dbd_data::commands::get_killswitch,
            features::dbd_data::commands::get_data_versions,
            features::dbd_data::commands::get_rank_reset,
            features::dbd_data::commands::get_top_stats,
            features::dbd_data::commands::get_characters,
            features::dbd_data::commands::get_perks,
            features::dbd_data::commands::get_maps,
            features::dbd_data::commands::get_offerings,
            features::dbd_data::commands::get_items,
            features::dbd_data::commands::get_addons,
            features::dbd_data::commands::get_archives,
            features::dbd_data::commands::get_journals,
            features::dbd_data::commands::get_rift,
            features::about::commands::get_app_credit,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
