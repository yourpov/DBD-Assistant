use crate::error::AppError;
use crate::infrastructure::http::browser_client;
use crate::ports::RegionStatusProvider;
use async_trait::async_trait;
use serde::Deserialize;
use std::collections::HashMap;

const REGIONS_ENDPOINT: &str = "https://api2.deadbyqueue.com/regions";

#[derive(Deserialize)]
struct RegionsResponse {
    regions: HashMap<String, bool>,
}

pub struct DeadByQueueStatusProvider {
    client: reqwest::Client,
}

impl DeadByQueueStatusProvider {
    pub fn new() -> Self {
        Self { client: browser_client() }
    }
}

#[async_trait]
impl RegionStatusProvider for DeadByQueueStatusProvider {
    async fn fetch_statuses(&self) -> Result<HashMap<String, bool>, AppError> {
        let response = self
            .client
            .get(REGIONS_ENDPOINT)
            .send()
            .await
            .map_err(|e| AppError::Launch(format!("failed to reach deadbyqueue.com: {e}")))?
            .json::<RegionsResponse>()
            .await
            .map_err(|e| AppError::Launch(format!("unexpected response from deadbyqueue.com: {e}")))?;
        Ok(response.regions)
    }
}
