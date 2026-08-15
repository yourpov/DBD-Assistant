use crate::error::AppError;
use crate::infrastructure::http::browser_client;
use crate::ports::{
    ArchiveLevelRaw, ArchiveNodeRaw, ArchiveRaw, CatalogEntryRaw, DataVersionRaw, DbdDataProvider, DlcRaw, EventRaw,
    GameModeRaw, JournalEntryRaw, JournalRaw, KillswitchRaw, PlayerFullStatsRaw, RiftRaw, RiftTierRaw, ShrinePerkRaw,
    ShrineRaw, TopStatRaw,
};
use async_trait::async_trait;
use serde::Deserialize;
use std::collections::HashMap;

const BASE_URL: &str = "https://dbd.tricky.lol/api";

pub struct TrickyApiClient {
    client: reqwest::Client,
}

impl TrickyApiClient {
    pub fn new() -> Self {
        Self { client: browser_client() }
    }

    async fn get_text(&self, path: &str) -> Result<String, AppError> {
        self.client
            .get(format!("{BASE_URL}{path}"))
            .send()
            .await
            .map_err(|e| AppError::Launch(format!("failed to reach dbd.tricky.lol: {e}")))?
            .text()
            .await
            .map_err(|e| AppError::Launch(format!("unreadable response from dbd.tricky.lol: {e}")))
    }

    async fn get_optional_text(&self, path: &str) -> Result<Option<String>, AppError> {
        let body = self.get_text(path).await?;
        let trimmed = body.trim();
        if trimmed.is_empty() {
            Ok(None)
        } else {
            Ok(Some(trimmed.to_string()))
        }
    }

    async fn get_json<T: serde::de::DeserializeOwned>(&self, path: &str) -> Result<T, AppError> {
        let body = self.get_text(path).await?;
        serde_json::from_str(&body).map_err(|e| AppError::Launch(format!("unexpected response from {path}: {e}")))
    }
}

#[derive(Deserialize)]
struct ShrineResponse {
    perks: Vec<ShrinePerkResponse>,
    start: i64,
    end: i64,
}

#[derive(Deserialize)]
struct ShrinePerkResponse {
    id: String,
    name: Option<String>,
    character: Option<String>,
    description: Option<String>,
    bloodpoints: u32,
    shards: u32,
}

#[derive(Deserialize)]
struct PatchNoteResponse {
    id: String,
    notes: String,
}

#[derive(Deserialize)]
struct PlayerCountSnapshot {
    playercount: u32,
    updated_at: i64,
}

#[derive(Deserialize)]
struct PlayerAdeptsResponse {
    total: u32,
}

#[derive(Deserialize)]
struct LeaderboardPositionResponse {
    position: u64,
}

#[derive(Deserialize, Default)]
#[serde(default)]
struct FullPlayerStatsResponse {
    bloodpoints: u64,
    escaped: u32,
    saved: u32,
    killed: u32,
    sacrificed: u32,
    skillchecks: u32,
    gensrepaired: u32,
    survivorshealed: u32,
    escaped_hatch: u32,
    hatchesclosed: u32,
    survivor_perfectgames: u32,
    killer_perfectgames: u32,
    survivor_rank: u32,
    killer_rank: u32,
    playtime: u64,
    exitgatesopened: u32,
    hextotemscleansed: u32,
    chestssearched: u32,
    unhookedself: u32,
    protectionhits_unhooked: u32,
    survivorsgrabbedrepairinggen: u32,
    survivorsthreehookedbasementsametime: u32,
    sacrificed_allbeforelastgen: u32,
    killed_sacrificed_afterlastgen: u32,
    updated_at: i64,
    created_at: i64,
}

impl From<FullPlayerStatsResponse> for PlayerFullStatsRaw {
    fn from(r: FullPlayerStatsResponse) -> Self {
        Self {
            bloodpoints: r.bloodpoints,
            escaped: r.escaped,
            survivors_saved: r.saved,
            survivors_killed: r.killed,
            survivors_sacrificed: r.sacrificed,
            skill_checks: r.skillchecks,
            generators_repaired: r.gensrepaired,
            survivors_healed: r.survivorshealed,
            hatch_escapes: r.escaped_hatch,
            hatches_closed: r.hatchesclosed,
            survivor_perfect_games: r.survivor_perfectgames,
            killer_perfect_games: r.killer_perfectgames,
            survivor_grade: r.survivor_rank,
            killer_grade: r.killer_rank,
            playtime_minutes: r.playtime,
            exit_gates_opened: r.exitgatesopened,
            hex_totems_cleansed: r.hextotemscleansed,
            chests_searched: r.chestssearched,
            unhooked_self: r.unhookedself,
            protection_hits: r.protectionhits_unhooked,
            survivors_grabbed_from_gen: r.survivorsgrabbedrepairinggen,
            basement_parties: r.survivorsthreehookedbasementsametime,
            sacrificed_before_last_gen: r.sacrificed_allbeforelastgen,
            killed_or_sacrificed_after_last_gen: r.killed_sacrificed_afterlastgen,
            updated_at_unix: r.updated_at,
            created_at_unix: r.created_at,
        }
    }
}

#[async_trait]
impl DbdDataProvider for TrickyApiClient {
    async fn fetch_shrine(&self) -> Result<ShrineRaw, AppError> {
        let body = self.get_text("/shrine?includeperkinfo=1").await?;
        let parsed: ShrineResponse =
            serde_json::from_str(&body).map_err(|e| AppError::Launch(format!("unexpected shrine response: {e}")))?;
        Ok(ShrineRaw {
            perks: parsed
                .perks
                .into_iter()
                .map(|p| ShrinePerkRaw {
                    id: p.id,
                    name: p.name,
                    character: p.character,
                    description: p.description,
                    bloodpoints: p.bloodpoints,
                    shards: p.shards,
                })
                .collect(),
            start: parsed.start,
            end: parsed.end,
        })
    }

    async fn fetch_latest_patch_notes(&self) -> Result<(String, String), AppError> {
        let body = self.get_text("/patchnotes").await?;
        let parsed: Vec<PatchNoteResponse> =
            serde_json::from_str(&body).map_err(|e| AppError::Launch(format!("unexpected patch notes response: {e}")))?;
        let latest = parsed
            .into_iter()
            .max_by(|a, b| compare_versions(&a.id, &b.id))
            .ok_or_else(|| AppError::Launch("API returned no patch notes".into()))?;
        Ok((latest.id, latest.notes))
    }

    async fn fetch_player_count(&self) -> Result<u32, AppError> {
        let snapshots: Vec<PlayerCountSnapshot> = self.get_json("/playercount").await?;
        snapshots
            .into_iter()
            .max_by_key(|s| s.updated_at)
            .map(|s| s.playercount)
            .ok_or_else(|| AppError::Launch("API returned no player count data".into()))
    }

    async fn fetch_player_stat(&self, steam_id: &str, stat: &str) -> Result<Option<String>, AppError> {
        self.get_optional_text(&format!("/playerstats?steamid={steam_id}&stat={stat}")).await
    }

    async fn fetch_player_adepts(&self, steam_id: &str) -> Result<Option<String>, AppError> {
        let Some(body) = self.get_optional_text(&format!("/playeradepts?steamid={steam_id}")).await? else {
            return Ok(None);
        };
        let parsed: PlayerAdeptsResponse =
            serde_json::from_str(&body).map_err(|e| AppError::Launch(format!("unexpected player adepts response: {e}")))?;
        Ok(Some(parsed.total.to_string()))
    }

    async fn fetch_leaderboard_position(&self, steam_id: &str, stat: &str) -> Result<Option<String>, AppError> {
        let Some(body) =
            self.get_optional_text(&format!("/leaderboardposition?steamid={steam_id}&stat={stat}")).await?
        else {
            return Ok(None);
        };
        let parsed: LeaderboardPositionResponse = serde_json::from_str(&body)
            .map_err(|e| AppError::Launch(format!("unexpected leaderboard position response: {e}")))?;
        Ok(Some(parsed.position.to_string()))
    }

    async fn fetch_player_full_stats(&self, steam_id: &str) -> Result<Option<PlayerFullStatsRaw>, AppError> {
        let Some(body) = self.get_optional_text(&format!("/playerstats?steamid={steam_id}")).await? else {
            return Ok(None);
        };
        let parsed: FullPlayerStatsResponse =
            serde_json::from_str(&body).map_err(|e| AppError::Launch(format!("unexpected player stats response: {e}")))?;
        Ok(Some(parsed.into()))
    }

    async fn fetch_dlc(&self) -> Result<Vec<DlcRaw>, AppError> {
        let parsed: HashMap<String, DlcResponse> = self.get_json("/dlc").await?;
        Ok(parsed.into_iter().map(|(id, d)| DlcRaw { id, name: d.name, release_unix: d.time }).collect())
    }

    async fn fetch_events(&self) -> Result<Vec<EventRaw>, AppError> {
        let parsed: Vec<EventResponse> = self.get_json("/events").await?;
        Ok(parsed
            .into_iter()
            .map(|e| EventRaw {
                name: e.name,
                event_type: e.event_type,
                bonus_multiplier: e.bonus,
                start_unix: e.start,
                end_unix: e.end,
            })
            .collect())
    }

    async fn fetch_gamemodes(&self) -> Result<Vec<GameModeRaw>, AppError> {
        let parsed: HashMap<String, GameModeResponse> = self.get_json("/gamemodes").await?;
        Ok(parsed
            .into_iter()
            .map(|(id, m)| GameModeRaw { id, name: m.name, limited_time: m.limitedtime == 1 })
            .collect())
    }

    async fn fetch_killswitch(&self) -> Result<Vec<KillswitchRaw>, AppError> {
        let parsed: Vec<KillswitchResponse> = self.get_json("/killswitch").await?;
        Ok(parsed.into_iter().map(|k| KillswitchRaw { item: k.item, item_type: k.item_type }).collect())
    }

    async fn fetch_versions(&self) -> Result<Vec<DataVersionRaw>, AppError> {
        let parsed: HashMap<String, VersionResponse> = self.get_json("/versions").await?;
        Ok(parsed
            .into_iter()
            .map(|(category, v)| DataVersionRaw { category, version: v.version, last_update_unix: v.lastupdate })
            .collect())
    }

    async fn fetch_rankreset(&self) -> Result<i64, AppError> {
        let parsed: RankResetResponse = self.get_json("/rankreset").await?;
        Ok(parsed.rankreset)
    }

    async fn fetch_topstats(&self, stat: &str) -> Result<Vec<TopStatRaw>, AppError> {
        let parsed: Vec<TopStatResponse> = self.get_json(&format!("/topstats?stat={stat}")).await?;
        Ok(parsed
            .into_iter()
            .map(|t| TopStatRaw { steam_id: t.steamid.to_string(), persona: t.persona, value: t.value })
            .collect())
    }

    async fn fetch_characters(&self) -> Result<Vec<CatalogEntryRaw>, AppError> {
        let parsed: HashMap<String, CharacterResponse> = self.get_json("/characters").await?;
        Ok(parsed
            .into_values()
            .map(|c| CatalogEntryRaw {
                id: c.id,
                name: Some(c.name),
                tags: vec![c.role, c.difficulty],
                description: Some(c.bio),
            })
            .collect())
    }

    async fn fetch_perks(&self) -> Result<Vec<CatalogEntryRaw>, AppError> {
        let parsed: HashMap<String, PerkResponse> = self.get_json("/perks").await?;
        Ok(parsed
            .into_iter()
            .map(|(id, p)| {
                let mut tags = vec![p.role];
                tags.extend(p.categories.unwrap_or_default());
                CatalogEntryRaw { id, name: Some(p.name), tags, description: p.description }
            })
            .collect())
    }

    async fn fetch_maps(&self) -> Result<Vec<CatalogEntryRaw>, AppError> {
        let parsed: HashMap<String, MapResponse> = self.get_json("/maps").await?;
        Ok(parsed
            .into_iter()
            .map(|(id, m)| CatalogEntryRaw { id, name: m.name, tags: vec![m.realm], description: m.description })
            .collect())
    }

    async fn fetch_offerings(&self) -> Result<Vec<CatalogEntryRaw>, AppError> {
        let parsed: HashMap<String, OfferingResponse> = self.get_json("/offerings").await?;
        Ok(parsed
            .into_iter()
            .map(|(id, o)| {
                let mut tags = vec![o.rarity];
                tags.extend(o.role);
                if o.retired == 1 {
                    tags.push("retired".into());
                }
                CatalogEntryRaw { id, name: o.name, tags, description: o.description }
            })
            .collect())
    }

    async fn fetch_items(&self) -> Result<Vec<CatalogEntryRaw>, AppError> {
        let parsed: HashMap<String, RarityRoleResponse> = self.get_json("/items").await?;
        Ok(rarity_role_entries(parsed))
    }

    async fn fetch_addons(&self) -> Result<Vec<CatalogEntryRaw>, AppError> {
        let parsed: HashMap<String, RarityRoleResponse> = self.get_json("/addons").await?;
        Ok(rarity_role_entries(parsed))
    }

    async fn fetch_archives(&self) -> Result<Vec<ArchiveRaw>, AppError> {
        let parsed: HashMap<String, ArchiveResponse> = self.get_json("/archives").await?;
        Ok(parsed
            .into_iter()
            .map(|(id, a)| {
                let mut levels: Vec<ArchiveLevelRaw> = a
                    .levels
                    .into_iter()
                    .filter_map(|(level_key, l)| {
                        let level = level_key.parse::<u32>().ok()?;
                        let nodes = l
                            .nodes
                            .into_iter()
                            .map(|n| ArchiveNodeRaw { name: n.name, role: n.role, objective: n.objective })
                            .collect();
                        Some(ArchiveLevelRaw { level, nodes })
                    })
                    .collect();
                levels.sort_by_key(|l| l.level);
                ArchiveRaw { id, name: a.name, levels }
            })
            .collect())
    }

    async fn fetch_journals(&self) -> Result<Vec<JournalRaw>, AppError> {
        let parsed: HashMap<String, JournalResponse> = self.get_json("/journals").await?;
        Ok(parsed
            .into_iter()
            .map(|(id, j)| {
                let entries = j
                    .vignettes
                    .into_values()
                    .flat_map(|v| v.entries)
                    .map(|e| JournalEntryRaw { title: e.title, text: e.text })
                    .collect();
                JournalRaw { id, title: j.title, entries }
            })
            .collect())
    }

    async fn fetch_rift(&self) -> Result<Vec<RiftRaw>, AppError> {
        let parsed: HashMap<String, RiftResponse> = self.get_json("/rift").await?;
        Ok(parsed
            .into_iter()
            .map(|(id, r)| {
                let mut tier_numbers: Vec<u32> =
                    r.free.keys().chain(r.premium.keys()).filter_map(|k| k.parse::<u32>().ok()).collect();
                tier_numbers.sort_unstable();
                tier_numbers.dedup();

                let rewards = tier_numbers
                    .into_iter()
                    .map(|tier| {
                        let key = tier.to_string();
                        let ids_at = |tiers: &HashMap<String, Vec<RiftItemResponse>>| {
                            tiers.get(&key).map(|items| items.iter().map(|i| i.id.clone()).collect()).unwrap_or_default()
                        };
                        RiftTierRaw { tier, free_item_ids: ids_at(&r.free), premium_item_ids: ids_at(&r.premium) }
                    })
                    .collect();
                RiftRaw { id, tiers: r.tiers, rewards }
            })
            .collect())
    }
}

#[derive(Deserialize)]
struct DlcResponse {
    name: Option<String>,
    time: i64,
}

#[derive(Deserialize)]
struct EventResponse {
    name: Option<String>,
    #[serde(rename = "type")]
    event_type: String,
    bonus: f64,
    start: i64,
    end: i64,
}

#[derive(Deserialize)]
struct GameModeResponse {
    name: Option<String>,
    limitedtime: u8,
}

#[derive(Deserialize)]
struct KillswitchResponse {
    item: String,
    #[serde(rename = "type")]
    item_type: String,
}

#[derive(Deserialize)]
struct VersionResponse {
    version: String,
    lastupdate: i64,
}

#[derive(Deserialize)]
struct RankResetResponse {
    rankreset: i64,
}

#[derive(Deserialize)]
struct TopStatResponse {
    steamid: u64,
    persona: String,
    value: u64,
}

#[derive(Deserialize)]
struct CharacterResponse {
    id: String,
    name: String,
    role: String,
    difficulty: String,
    #[serde(default)]
    bio: String,
}

#[derive(Deserialize)]
struct PerkResponse {
    name: String,
    description: Option<String>,
    role: String,
    categories: Option<Vec<String>>,
}

#[derive(Deserialize)]
struct MapResponse {
    name: Option<String>,
    realm: String,
    description: Option<String>,
}

#[derive(Deserialize)]
struct OfferingResponse {
    name: Option<String>,
    rarity: String,
    role: Option<String>,
    description: Option<String>,
    #[serde(default)]
    retired: u8,
}

/// /items and /addons are the same
#[derive(Deserialize)]
struct RarityRoleResponse {
    name: Option<String>,
    rarity: Option<String>,
    role: Option<String>,
    description: Option<String>,
}

fn rarity_role_entries(parsed: HashMap<String, RarityRoleResponse>) -> Vec<CatalogEntryRaw> {
    parsed
        .into_iter()
        .map(|(id, r)| {
            let tags = r.rarity.into_iter().chain(r.role).collect();
            CatalogEntryRaw { id, name: r.name, tags, description: r.description }
        })
        .collect()
}

#[derive(Deserialize)]
struct ArchiveNodeResponse {
    name: Option<String>,
    role: String,
    objective: Option<String>,
}

#[derive(Deserialize)]
struct ArchiveLevelResponse {
    #[serde(default)]
    nodes: Vec<ArchiveNodeResponse>,
}

#[derive(Deserialize)]
struct ArchiveResponse {
    name: Option<String>,
    #[serde(default)]
    levels: HashMap<String, ArchiveLevelResponse>,
}

#[derive(Deserialize)]
struct JournalEntryResponse {
    title: String,
    text: Option<String>,
}

#[derive(Deserialize)]
struct VignetteResponse {
    #[serde(default)]
    entries: Vec<JournalEntryResponse>,
}

#[derive(Deserialize)]
struct JournalResponse {
    title: Option<String>,
    #[serde(default)]
    vignettes: HashMap<String, VignetteResponse>,
}

#[derive(Deserialize)]
struct RiftItemResponse {
    id: String,
}

#[derive(Deserialize)]
struct RiftResponse {
    #[serde(default)]
    tiers: u32,
    #[serde(default)]
    free: HashMap<String, Vec<RiftItemResponse>>,
    #[serde(default)]
    premium: HashMap<String, Vec<RiftItemResponse>>,
}

fn compare_versions(a: &str, b: &str) -> std::cmp::Ordering {
    let parse = |v: &str| -> Vec<u32> { v.split('.').map(|part| part.parse().unwrap_or(0)).collect() };
    parse(a).cmp(&parse(b))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn absent_player_stats_read_as_zero_rather_than_failing() {
        let parsed: FullPlayerStatsResponse = serde_json::from_str(r#"{"bloodpoints":1200,"saved":3}"#).unwrap();
        let raw = PlayerFullStatsRaw::from(parsed);

        assert_eq!(raw.bloodpoints, 1200);
        assert_eq!(raw.survivors_saved, 3);
        assert_eq!(raw.hatches_closed, 0);
        assert_eq!(raw.created_at_unix, 0);
    }

    #[test]
    fn compares_versions_numerically_not_lexically() {
        assert_eq!(compare_versions("10.0.0", "7.6.0"), std::cmp::Ordering::Greater);
        assert_eq!(compare_versions("7.6.0", "7.6.1"), std::cmp::Ordering::Less);
        assert_eq!(compare_versions("9.1.2", "9.1.2"), std::cmp::Ordering::Equal);
    }
}
