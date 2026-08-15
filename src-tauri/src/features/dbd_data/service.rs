use super::model::{
    Archive, ArchiveLevel, ArchiveNode, CatalogEntry, DataVersion, DlcEntry, GameEvent, GameMode, Journal,
    JournalEntry, KillswitchEntry, PatchNoteBlock, PatchNotes, PlayerFullStats, PlayerLookup, Rift, RiftTier,
    ShrinePerk, ShrineRotation, TopStatEntry,
};
use crate::error::AppError;
use crate::ports::{CatalogEntryRaw, DbdDataProvider};
use std::sync::Arc;

pub struct DbdDataService {
    provider: Arc<dyn DbdDataProvider>,
}

impl DbdDataService {
    pub fn new(provider: Arc<dyn DbdDataProvider>) -> Self {
        Self { provider }
    }

    pub async fn shrine(&self) -> Result<ShrineRotation, AppError> {
        let raw = self.provider.fetch_shrine().await?;
        Ok(ShrineRotation {
            perks: raw
                .perks
                .into_iter()
                .map(|p| ShrinePerk {
                    id: p.id,
                    name: p.name.unwrap_or_else(|| "Unknown Perk".into()),
                    character: p.character.unwrap_or_else(|| "Unknown".into()),
                    description: html_to_text(&p.description.unwrap_or_default()),
                    bloodpoints: p.bloodpoints,
                    shards: p.shards,
                })
                .collect(),
            start_unix: raw.start,
            end_unix: raw.end,
        })
    }

    pub async fn latest_patch_notes(&self) -> Result<PatchNotes, AppError> {
        let (version, notes) = self.provider.fetch_latest_patch_notes().await?;
        Ok(PatchNotes { version, blocks: html_to_blocks(&notes) })
    }

    pub async fn player_count(&self) -> Result<u32, AppError> {
        self.provider.fetch_player_count().await
    }

    pub async fn player_lookup(&self, steam_id: &str) -> Result<PlayerLookup, AppError> {
        let (bloodpoints, bloodpoints_rank, adepts) = tokio::join!(
            self.provider.fetch_player_stat(steam_id, "bloodpoints"),
            self.provider.fetch_leaderboard_position(steam_id, "bloodpoints"),
            self.provider.fetch_player_adepts(steam_id),
        );
        Ok(PlayerLookup {
            steam_id: steam_id.to_string(),
            bloodpoints: log_and_discard(bloodpoints),
            bloodpoints_rank: log_and_discard(bloodpoints_rank),
            adepts: log_and_discard(adepts),
        })
    }

    pub async fn player_full_stats(&self, steam_id: &str) -> Result<Option<PlayerFullStats>, AppError> {
        let raw = self.provider.fetch_player_full_stats(steam_id).await?;
        Ok(raw.map(PlayerFullStats::from))
    }

    pub async fn dlc(&self) -> Result<Vec<DlcEntry>, AppError> {
        let mut items: Vec<DlcEntry> = self
            .provider
            .fetch_dlc()
            .await?
            .into_iter()
            .map(|d| DlcEntry { name: d.name.unwrap_or_else(|| d.id.clone()), id: d.id, release_unix: d.release_unix })
            .collect();
        items.sort_by_key(|d| d.release_unix);
        Ok(items)
    }

    pub async fn events(&self) -> Result<Vec<GameEvent>, AppError> {
        let mut items: Vec<GameEvent> = self
            .provider
            .fetch_events()
            .await?
            .into_iter()
            .map(|e| GameEvent {
                name: e.name.unwrap_or_else(|| e.event_type.clone()),
                event_type: e.event_type,
                bonus_multiplier: e.bonus_multiplier,
                start_unix: e.start_unix,
                end_unix: e.end_unix,
            })
            .collect();
        items.sort_by_key(|e| std::cmp::Reverse(e.start_unix));
        Ok(items)
    }

    pub async fn gamemodes(&self) -> Result<Vec<GameMode>, AppError> {
        let mut items: Vec<GameMode> = self
            .provider
            .fetch_gamemodes()
            .await?
            .into_iter()
            .filter_map(|m| m.name.map(|name| GameMode { id: m.id, name, limited_time: m.limited_time }))
            .collect();
        items.sort_by(|a, b| a.name.cmp(&b.name));
        Ok(items)
    }

    pub async fn killswitch(&self) -> Result<Vec<KillswitchEntry>, AppError> {
        Ok(self
            .provider
            .fetch_killswitch()
            .await?
            .into_iter()
            .map(|k| KillswitchEntry { item: k.item, item_type: k.item_type })
            .collect())
    }

    pub async fn data_versions(&self) -> Result<Vec<DataVersion>, AppError> {
        let mut items: Vec<DataVersion> = self
            .provider
            .fetch_versions()
            .await?
            .into_iter()
            .map(|v| DataVersion { category: v.category, version: v.version, last_update_unix: v.last_update_unix })
            .collect();
        items.sort_by(|a, b| a.category.cmp(&b.category));
        Ok(items)
    }

    pub async fn rank_reset(&self) -> Result<i64, AppError> {
        self.provider.fetch_rankreset().await
    }

    pub async fn top_stats(&self, stat: &str) -> Result<Vec<TopStatEntry>, AppError> {
        let mut items: Vec<TopStatEntry> = self
            .provider
            .fetch_topstats(stat)
            .await?
            .into_iter()
            .map(|t| TopStatEntry { steam_id: t.steam_id, persona: t.persona, value: t.value })
            .collect();
        items.sort_by_key(|t| std::cmp::Reverse(t.value));
        Ok(items)
    }

    pub async fn characters(&self) -> Result<Vec<CatalogEntry>, AppError> {
        Ok(sorted_catalog(self.provider.fetch_characters().await?))
    }

    pub async fn perks(&self) -> Result<Vec<CatalogEntry>, AppError> {
        Ok(sorted_catalog(self.provider.fetch_perks().await?))
    }

    pub async fn maps(&self) -> Result<Vec<CatalogEntry>, AppError> {
        Ok(sorted_catalog(self.provider.fetch_maps().await?))
    }

    pub async fn offerings(&self) -> Result<Vec<CatalogEntry>, AppError> {
        Ok(sorted_catalog(self.provider.fetch_offerings().await?))
    }

    pub async fn items(&self) -> Result<Vec<CatalogEntry>, AppError> {
        Ok(sorted_catalog(self.provider.fetch_items().await?))
    }

    pub async fn addons(&self) -> Result<Vec<CatalogEntry>, AppError> {
        Ok(sorted_catalog(self.provider.fetch_addons().await?))
    }

    pub async fn archives(&self) -> Result<Vec<Archive>, AppError> {
        let mut items: Vec<Archive> = self
            .provider
            .fetch_archives()
            .await?
            .into_iter()
            .map(|a| Archive {
                name: a.name.unwrap_or_else(|| a.id.clone()),
                id: a.id,
                levels: a
                    .levels
                    .into_iter()
                    .map(|l| ArchiveLevel {
                        level: l.level,
                        nodes: l
                            .nodes
                            .into_iter()
                            .map(|n| ArchiveNode {
                                name: n.name.unwrap_or_else(|| "Reward".into()),
                                role: n.role,
                                objective: html_to_text(&n.objective.unwrap_or_default()),
                            })
                            .collect(),
                    })
                    .collect(),
            })
            .collect();
        items.sort_by(|a, b| a.name.cmp(&b.name));
        Ok(items)
    }

    pub async fn journals(&self) -> Result<Vec<Journal>, AppError> {
        let mut items: Vec<Journal> = self
            .provider
            .fetch_journals()
            .await?
            .into_iter()
            .map(|j| Journal {
                title: j.title.unwrap_or_else(|| j.id.clone()),
                id: j.id,
                entries: j
                    .entries
                    .into_iter()
                    .map(|e| JournalEntry { title: e.title, text: html_to_text(&e.text.unwrap_or_default()) })
                    .collect(),
            })
            .collect();
        items.sort_by(|a, b| a.title.cmp(&b.title));
        Ok(items)
    }

    pub async fn rift(&self) -> Result<Vec<Rift>, AppError> {
        let mut items: Vec<Rift> = self
            .provider
            .fetch_rift()
            .await?
            .into_iter()
            .map(|r| Rift {
                id: r.id,
                tiers: r.tiers,
                rewards: r
                    .rewards
                    .into_iter()
                    .map(|t| RiftTier {
                        tier: t.tier,
                        free_item_ids: t.free_item_ids,
                        premium_item_ids: t.premium_item_ids,
                    })
                    .collect(),
            })
            .collect();
        items.sort_by(|a, b| a.id.cmp(&b.id));
        Ok(items)
    }
}

fn sorted_catalog(raw: Vec<CatalogEntryRaw>) -> Vec<CatalogEntry> {
    let mut items: Vec<CatalogEntry> = raw
        .into_iter()
        .map(|c| CatalogEntry {
            name: c.name.unwrap_or_else(|| c.id.clone()),
            id: c.id,
            tags: c.tags,
            description: html_to_text(&c.description.unwrap_or_default()),
        })
        .collect();
    items.sort_by(|a, b| a.name.cmp(&b.name));
    items
}

fn log_and_discard(result: Result<Option<String>, AppError>) -> Option<String> {
    result
        .inspect_err(|e| eprintln!("player stat fetch failed, showing as not public: {e}"))
        .ok()
        .flatten()
}

fn decode_entities(text: &str) -> String {
    text.replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
        .replace('\u{202f}', " ")
}

fn strip_tags(html: &str) -> String {
    let mut stripped = String::with_capacity(html.len());
    let mut in_tag = false;
    for c in html.chars() {
        match c {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => stripped.push(c),
            _ => {}
        }
    }
    decode_entities(&stripped)
}

fn html_to_text(html: &str) -> String {
    let mut text = html.to_string();

    for tag in ["</p>", "</li>", "</h2>", "</h3>", "</h4>", "<br>", "<br/>", "<br />"] {
        text = text.replace(tag, "\n");
    }
    for tag in ["<h2>", "<h3>", "<h4>"] {
        text = text.replace(tag, "\n\n");
    }
    text = text.replace("<li>", "- ").replace("<ul>", "").replace("</ul>", "");

    let decoded = strip_tags(&text);

    let mut result = String::new();
    let mut blank_streak = 0;
    for line in decoded.lines().map(str::trim) {
        if line.is_empty() {
            blank_streak += 1;
            if blank_streak > 1 {
                continue;
            }
        } else {
            blank_streak = 0;
        }
        result.push_str(line);
        result.push('\n');
    }
    result.trim().to_string()
}

fn html_to_blocks(html: &str) -> Vec<PatchNoteBlock> {
    const BLOCK_TAGS: &[(&str, &str, &str)] =
        &[("<h2>", "</h2>", "heading"), ("<h3>", "</h3>", "heading"), ("<h4>", "</h4>", "heading"), ("<li>", "</li>", "listItem"), ("<p>", "</p>", "paragraph")];

    let mut blocks = Vec::new();
    let mut pos = 0;
    while pos < html.len() {
        let next = BLOCK_TAGS
            .iter()
            .filter_map(|(open, close, kind)| html[pos..].find(open).map(|offset| (pos + offset, *open, *close, *kind)))
            .min_by_key(|(offset, ..)| *offset);

        let Some((start, open, close, kind)) = next else { break };
        let content_start = start + open.len();
        let Some(close_offset) = html[content_start..].find(close) else { break };
        let content_end = content_start + close_offset;

        let text = strip_tags(&html[content_start..content_end].replace("<br>", "\n").replace("<br/>", "\n").replace("<br />", "\n"));
        let text = text.trim();
        if !text.is_empty() {
            blocks.push(PatchNoteBlock { kind: kind.to_string(), text: text.to_string() });
        }
        pos = content_end + close.len();
    }
    blocks
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_tags_and_keeps_readable_line_breaks() {
        let html = "<h2>Content</h2>\n<ul>\n<li>First point.</li>\n<li>Second point.</li>\n</ul>\n<p>Closing line.</p>";
        let text = html_to_text(html);
        assert!(text.contains("Content"));
        assert!(text.contains("- First point."));
        assert!(text.contains("- Second point."));
        assert!(text.contains("Closing line."));
        assert!(!text.contains('<'));
        assert!(!text.contains('>'));
    }

    #[test]
    fn html_to_blocks_preserves_heading_and_list_structure() {
        let html = "<h2>Bug Fixes</h2><ul><li>Fixed a <b>crash</b>.</li><li>Fixed audio.</li></ul><p>General note.<br>Second line.</p>";
        let blocks = html_to_blocks(html);
        assert_eq!(blocks.len(), 4);
        assert_eq!(blocks[0].kind, "heading");
        assert_eq!(blocks[0].text, "Bug Fixes");
        assert_eq!(blocks[1].kind, "listItem");
        assert_eq!(blocks[1].text, "Fixed a crash.");
        assert_eq!(blocks[2].kind, "listItem");
        assert_eq!(blocks[2].text, "Fixed audio.");
        assert_eq!(blocks[3].kind, "paragraph");
        assert_eq!(blocks[3].text, "General note.\nSecond line.");
    }

    #[test]
    fn html_to_blocks_drops_empty_blocks() {
        let blocks = html_to_blocks("<h2></h2><li>   </li><p>Real content.</p>");
        assert_eq!(blocks.len(), 1);
        assert_eq!(blocks[0].text, "Real content.");
    }

    #[test]
    fn decodes_common_entities_and_collapses_blank_runs() {
        let html = "<p>Within 25%&nbsp;faster &amp; safer.</p>\n\n\n\n<p>Next.</p>";
        let text = html_to_text(html);
        assert_eq!(text, "Within 25% faster & safer.\n\nNext.");
    }
}
