use crate::error::AppError;
use async_trait::async_trait;
use std::collections::HashMap;
use std::path::PathBuf;

#[async_trait]
pub trait ProcessMonitor: Send + Sync {
    async fn is_running(&self, process_name: &str) -> bool;
    async fn kill_all(&self, process_name: &str) -> Result<(), AppError>;
}

#[async_trait]
pub trait ProcessLauncher: Send + Sync {
    async fn launch_uri(&self, uri: &str) -> Result<(), AppError>;
}

#[async_trait]
pub trait RegionStatusProvider: Send + Sync {
    async fn fetch_statuses(&self) -> Result<HashMap<String, bool>, AppError>;
}

#[async_trait]
pub trait HostsFileStore: Send + Sync {
    async fn read_blocked_codes(&self) -> Result<Vec<String>, AppError>;
    async fn apply_blocked_codes(&self, codes: &[String]) -> Result<(), AppError>;
}

#[async_trait]
pub trait ElevatedRunner: Send + Sync {
    async fn run_self_elevated(&self, args: &[&str]) -> Result<(), AppError>;
}

pub struct AppCreditRaw {
    pub username: String,
    pub display_name: Option<String>,
    pub avatar_data_url: String,
    pub decoration_data_url: Option<String>,
    pub status: String,
    pub activity_text: Option<String>,
}

#[async_trait]
pub trait AppCreditProvider: Send + Sync {
    async fn fetch_credit(&self, discord_user_id: &str) -> Result<AppCreditRaw, AppError>;
}

pub struct GameInstall {
    pub platform: String,
    pub install_location: PathBuf,
    pub executable: PathBuf,
    pub version: String,
    pub launch_uri: String,
}

pub trait GameManifestReader: Send + Sync {
    fn find_install(&self, display_name: &str) -> Result<Option<GameInstall>, AppError>;
}

pub struct ShrinePerkRaw {
    pub id: String,
    pub name: Option<String>,
    pub character: Option<String>,
    pub description: Option<String>,
    pub bloodpoints: u32,
    pub shards: u32,
}

pub struct ShrineRaw {
    pub perks: Vec<ShrinePerkRaw>,
    pub start: i64,
    pub end: i64,
}

pub struct DlcRaw {
    pub id: String,
    pub name: Option<String>,
    pub release_unix: i64,
}

pub struct EventRaw {
    pub name: Option<String>,
    pub event_type: String,
    pub bonus_multiplier: f64,
    pub start_unix: i64,
    pub end_unix: i64,
}

pub struct GameModeRaw {
    pub id: String,
    pub name: Option<String>,
    pub limited_time: bool,
}

pub struct KillswitchRaw {
    pub item: String,
    pub item_type: String,
}

pub struct DataVersionRaw {
    pub category: String,
    pub version: String,
    pub last_update_unix: i64,
}

pub struct TopStatRaw {
    pub steam_id: String,
    pub persona: String,
    pub value: u64,
}

pub struct CatalogEntryRaw {
    pub id: String,
    pub name: Option<String>,
    pub tags: Vec<String>,
    pub description: Option<String>,
}

pub struct ArchiveNodeRaw {
    pub name: Option<String>,
    pub role: String,
    pub objective: Option<String>,
}

pub struct ArchiveLevelRaw {
    pub level: u32,
    pub nodes: Vec<ArchiveNodeRaw>,
}

pub struct ArchiveRaw {
    pub id: String,
    pub name: Option<String>,
    pub levels: Vec<ArchiveLevelRaw>,
}

pub struct JournalEntryRaw {
    pub title: String,
    pub text: Option<String>,
}

pub struct JournalRaw {
    pub id: String,
    pub title: Option<String>,
    pub entries: Vec<JournalEntryRaw>,
}

pub struct RiftTierRaw {
    pub tier: u32,
    pub free_item_ids: Vec<String>,
    pub premium_item_ids: Vec<String>,
}

pub struct RiftRaw {
    pub id: String,
    pub tiers: u32,
    pub rewards: Vec<RiftTierRaw>,
}

pub struct PlayerFullStatsRaw {
    pub bloodpoints: u64,
    pub escaped: u32,
    pub survivors_saved: u32,
    pub survivors_killed: u32,
    pub survivors_sacrificed: u32,
    pub skill_checks: u32,
    pub generators_repaired: u32,
    pub survivors_healed: u32,
    pub hatch_escapes: u32,
    pub hatches_closed: u32,
    pub survivor_perfect_games: u32,
    pub killer_perfect_games: u32,
    pub survivor_grade: u32,
    pub killer_grade: u32,
    pub playtime_minutes: u64,
    pub exit_gates_opened: u32,
    pub hex_totems_cleansed: u32,
    pub chests_searched: u32,
    pub unhooked_self: u32,
    pub protection_hits: u32,
    pub survivors_grabbed_from_gen: u32,
    pub basement_parties: u32,
    pub sacrificed_before_last_gen: u32,
    pub killed_or_sacrificed_after_last_gen: u32,
    pub updated_at_unix: i64,
    pub created_at_unix: i64,
}

#[async_trait]
pub trait DbdDataProvider: Send + Sync {
    async fn fetch_shrine(&self) -> Result<ShrineRaw, AppError>;
    async fn fetch_latest_patch_notes(&self) -> Result<(String, String), AppError>;
    async fn fetch_player_count(&self) -> Result<u32, AppError>;
    async fn fetch_player_stat(&self, steam_id: &str, stat: &str) -> Result<Option<String>, AppError>;
    async fn fetch_player_adepts(&self, steam_id: &str) -> Result<Option<String>, AppError>;
    async fn fetch_leaderboard_position(&self, steam_id: &str, stat: &str) -> Result<Option<String>, AppError>;
    async fn fetch_player_full_stats(&self, steam_id: &str) -> Result<Option<PlayerFullStatsRaw>, AppError>;
    async fn fetch_dlc(&self) -> Result<Vec<DlcRaw>, AppError>;
    async fn fetch_events(&self) -> Result<Vec<EventRaw>, AppError>;
    async fn fetch_gamemodes(&self) -> Result<Vec<GameModeRaw>, AppError>;
    async fn fetch_killswitch(&self) -> Result<Vec<KillswitchRaw>, AppError>;
    async fn fetch_versions(&self) -> Result<Vec<DataVersionRaw>, AppError>;
    async fn fetch_rankreset(&self) -> Result<i64, AppError>;
    async fn fetch_topstats(&self, stat: &str) -> Result<Vec<TopStatRaw>, AppError>;
    async fn fetch_characters(&self) -> Result<Vec<CatalogEntryRaw>, AppError>;
    async fn fetch_perks(&self) -> Result<Vec<CatalogEntryRaw>, AppError>;
    async fn fetch_maps(&self) -> Result<Vec<CatalogEntryRaw>, AppError>;
    async fn fetch_offerings(&self) -> Result<Vec<CatalogEntryRaw>, AppError>;
    async fn fetch_items(&self) -> Result<Vec<CatalogEntryRaw>, AppError>;
    async fn fetch_addons(&self) -> Result<Vec<CatalogEntryRaw>, AppError>;
    async fn fetch_archives(&self) -> Result<Vec<ArchiveRaw>, AppError>;
    async fn fetch_journals(&self) -> Result<Vec<JournalRaw>, AppError>;
    async fn fetch_rift(&self) -> Result<Vec<RiftRaw>, AppError>;
}
