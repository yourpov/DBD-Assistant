use super::model::AppCredit;
use crate::error::AppError;
use crate::ports::AppCreditProvider;
use std::sync::Arc;

pub struct AboutService {
    provider: Arc<dyn AppCreditProvider>,
}

impl AboutService {
    pub fn new(provider: Arc<dyn AppCreditProvider>) -> Self {
        Self { provider }
    }

    pub async fn credit(&self, discord_user_id: &str) -> Result<AppCredit, AppError> {
        let raw = self.provider.fetch_credit(discord_user_id).await?;
        Ok(AppCredit {
            display_name: raw.display_name.unwrap_or_else(|| raw.username.clone()),
            username: raw.username,
            avatar_data_url: raw.avatar_data_url,
            decoration_data_url: raw.decoration_data_url,
            status: raw.status,
            activity_text: raw.activity_text,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ports::AppCreditRaw;
    use async_trait::async_trait;

    struct FakeCreditProvider {
        display_name: Option<String>,
    }

    #[async_trait]
    impl AppCreditProvider for FakeCreditProvider {
        async fn fetch_credit(&self, _discord_user_id: &str) -> Result<AppCreditRaw, AppError> {
            Ok(AppCreditRaw {
                username: "pov".into(),
                display_name: self.display_name.clone(),
                avatar_data_url: "data:image/png;base64,".into(),
                decoration_data_url: None,
                status: "online".into(),
                activity_text: None,
            })
        }
    }

    #[tokio::test]
    async fn uses_the_discord_display_name_when_there_is_one() {
        let service = AboutService::new(Arc::new(FakeCreditProvider { display_name: Some("Pov".into()) }));
        assert_eq!(service.credit("1").await.unwrap().display_name, "Pov");
    }

    #[tokio::test]
    async fn falls_back_to_the_username_when_no_display_name_is_set() {
        let service = AboutService::new(Arc::new(FakeCreditProvider { display_name: None }));
        assert_eq!(service.credit("1").await.unwrap().display_name, "pov");
    }
}
