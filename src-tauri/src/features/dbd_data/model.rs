use crate::ports::PlayerFullStatsRaw;
use serde::Serialize;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShrinePerk {
    pub id: String,
    pub name: String,
    pub character: String,
    pub description: String,
    pub bloodpoints: u32,
    pub shards: u32,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShrineRotation {
    pub perks: Vec<ShrinePerk>,
    pub start_unix: i64,
    pub end_unix: i64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PatchNoteBlock {
    pub kind: String,
    pub text: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PatchNotes {
    pub version: String,
    pub blocks: Vec<PatchNoteBlock>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PlayerLookup {
    pub steam_id: String,
    pub bloodpoints: Option<String>,
    pub bloodpoints_rank: Option<String>,
    pub adepts: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PlayerFullStats {
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

impl From<PlayerFullStatsRaw> for PlayerFullStats {
    fn from(raw: PlayerFullStatsRaw) -> Self {
        Self {
            bloodpoints: raw.bloodpoints,
            escaped: raw.escaped,
            survivors_saved: raw.survivors_saved,
            survivors_killed: raw.survivors_killed,
            survivors_sacrificed: raw.survivors_sacrificed,
            skill_checks: raw.skill_checks,
            generators_repaired: raw.generators_repaired,
            survivors_healed: raw.survivors_healed,
            hatch_escapes: raw.hatch_escapes,
            hatches_closed: raw.hatches_closed,
            survivor_perfect_games: raw.survivor_perfect_games,
            killer_perfect_games: raw.killer_perfect_games,
            survivor_grade: raw.survivor_grade,
            killer_grade: raw.killer_grade,
            playtime_minutes: raw.playtime_minutes,
            exit_gates_opened: raw.exit_gates_opened,
            hex_totems_cleansed: raw.hex_totems_cleansed,
            chests_searched: raw.chests_searched,
            unhooked_self: raw.unhooked_self,
            protection_hits: raw.protection_hits,
            survivors_grabbed_from_gen: raw.survivors_grabbed_from_gen,
            basement_parties: raw.basement_parties,
            sacrificed_before_last_gen: raw.sacrificed_before_last_gen,
            killed_or_sacrificed_after_last_gen: raw.killed_or_sacrificed_after_last_gen,
            updated_at_unix: raw.updated_at_unix,
            created_at_unix: raw.created_at_unix,
        }
    }
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DlcEntry {
    pub id: String,
    pub name: String,
    pub release_unix: i64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GameEvent {
    pub name: String,
    pub event_type: String,
    pub bonus_multiplier: f64,
    pub start_unix: i64,
    pub end_unix: i64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GameMode {
    pub id: String,
    pub name: String,
    pub limited_time: bool,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct KillswitchEntry {
    pub item: String,
    pub item_type: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DataVersion {
    pub category: String,
    pub version: String,
    pub last_update_unix: i64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TopStatEntry {
    pub steam_id: String,
    pub persona: String,
    pub value: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CatalogEntry {
    pub id: String,
    pub name: String,
    pub tags: Vec<String>,
    pub description: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveNode {
    pub name: String,
    pub role: String,
    pub objective: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveLevel {
    pub level: u32,
    pub nodes: Vec<ArchiveNode>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Archive {
    pub id: String,
    pub name: String,
    pub levels: Vec<ArchiveLevel>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct JournalEntry {
    pub title: String,
    pub text: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Journal {
    pub id: String,
    pub title: String,
    pub entries: Vec<JournalEntry>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RiftTier {
    pub tier: u32,
    pub free_item_ids: Vec<String>,
    pub premium_item_ids: Vec<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Rift {
    pub id: String,
    pub tiers: u32,
    pub rewards: Vec<RiftTier>,
}
