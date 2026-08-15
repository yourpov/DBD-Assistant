use async_trait::async_trait;
use base64::Engine;
use serde::Deserialize;

use crate::error::AppError;
use crate::infrastructure::http::browser_client;
use crate::ports::{AppCreditProvider, AppCreditRaw};

const CUSTOM_STATUS_ACTIVITY_TYPE: u8 = 4;
const DEFAULT_AVATAR_URL: &str = "https://cdn.discordapp.com/embed/avatars/0.png";

#[derive(Debug, Deserialize)]
struct LanyardResponse {
    success: bool,
    data: Option<LanyardData>,
}

#[derive(Debug, Deserialize)]
struct LanyardData {
    discord_user: DiscordUser,
    discord_status: String,
    activities: Vec<Activity>,
}

#[derive(Debug, Deserialize)]
struct DiscordUser {
    id: String,
    username: String,
    global_name: Option<String>,
    avatar: Option<String>,
    avatar_decoration_data: Option<AvatarDecoration>,
}

#[derive(Debug, Deserialize)]
struct AvatarDecoration {
    asset: String,
}

#[derive(Debug, Deserialize)]
struct Activity {
    #[serde(rename = "type")]
    kind: u8,
    state: Option<String>,
}

pub struct LanyardClient {
    client: reqwest::Client,
}

impl LanyardClient {
    pub fn new() -> Self {
        Self { client: browser_client() }
    }

    async fn fetch_as_data_url(&self, url: &str) -> Result<String, AppError> {
        let response = self
            .client
            .get(url)
            .send()
            .await
            .map_err(|e| AppError::Launch(format!("couldn't download {url}: {e}")))?;
        let content_type = response
            .headers()
            .get("content-type")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("image/png")
            .to_string();
        let bytes = response.bytes().await.map_err(|e| AppError::Launch(format!("couldn't read {url}: {e}")))?;
        let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
        Ok(format!("data:{content_type};base64,{encoded}"))
    }
}

#[async_trait]
impl AppCreditProvider for LanyardClient {
    async fn fetch_credit(&self, discord_user_id: &str) -> Result<AppCreditRaw, AppError> {
        let response = self
            .client
            .get(format!("https://api.lanyard.rest/v1/users/{discord_user_id}"))
            .send()
            .await
            .map_err(|e| AppError::Launch(format!("couldn't reach lanyard: {e}")))?;
        let parsed: LanyardResponse = response
            .json()
            .await
            .map_err(|e| AppError::Launch(format!("couldn't read lanyard's response: {e}")))?;
        let data = parsed
            .data
            .filter(|_| parsed.success)
            .ok_or_else(|| AppError::Launch("lanyard has no data for this user".into()))?;

        let avatar_url = match &data.discord_user.avatar {
            Some(hash) => format!("https://cdn.discordapp.com/avatars/{}/{hash}.png?size=128", data.discord_user.id),
            None => DEFAULT_AVATAR_URL.to_string(),
        };
        let avatar_data_url = self.fetch_as_data_url(&avatar_url).await?;

        let decoration_data_url = match &data.discord_user.avatar_decoration_data {
            Some(decoration) => {
                let url =
                    format!("https://cdn.discordapp.com/avatar-decoration-presets/{}.png", decoration.asset);
                Some(self.fetch_as_data_url(&url).await?)
            }
            None => None,
        };

        let activity_text = data
            .activities
            .iter()
            .find(|a| a.kind == CUSTOM_STATUS_ACTIVITY_TYPE)
            .and_then(|a| a.state.clone());

        Ok(AppCreditRaw {
            username: data.discord_user.username,
            display_name: data.discord_user.global_name,
            avatar_data_url,
            decoration_data_url,
            status: data.discord_status,
            activity_text,
        })
    }
}
