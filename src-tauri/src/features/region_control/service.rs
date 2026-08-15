use super::model::Region;
use crate::error::AppError;
use crate::infrastructure::region_data::REGIONS;
use crate::ports::{HostsFileStore, RegionStatusProvider};
use std::sync::Arc;

pub struct RegionControlService {
    status_provider: Arc<dyn RegionStatusProvider>,
    hosts_store: Arc<dyn HostsFileStore>,
}

impl RegionControlService {
    pub fn new(status_provider: Arc<dyn RegionStatusProvider>, hosts_store: Arc<dyn HostsFileStore>) -> Self {
        Self { status_provider, hosts_store }
    }

    pub async fn list_regions(&self) -> Result<Vec<Region>, AppError> {
        let statuses = self.status_provider.fetch_statuses().await.inspect_err(|e| {
            eprintln!("region status fetch failed, showing regions as unknown: {e}");
        }).ok();
        let blocked = self.hosts_store.read_blocked_codes().await?;

        Ok(REGIONS
            .iter()
            .map(|region| Region {
                code: region.code.to_string(),
                name: region.name.to_string(),
                area: region.area.to_string(),
                online: statuses.as_ref().and_then(|s| s.get(region.code)).copied(),
                blocked: blocked.iter().any(|c| c == region.code),
            })
            .collect())
    }

    pub async fn set_blocked_regions(&self, codes: Vec<String>) -> Result<(), AppError> {
        let known: Vec<String> = codes
            .into_iter()
            .filter(|code| REGIONS.iter().any(|r| r.code == code))
            .collect();
        self.hosts_store.apply_blocked_codes(&known).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::error::AppError;
    use async_trait::async_trait;
    use std::collections::HashMap;
    use std::sync::Mutex;

    struct FakeStatusProvider {
        result: Result<HashMap<String, bool>, String>,
    }

    #[async_trait]
    impl RegionStatusProvider for FakeStatusProvider {
        async fn fetch_statuses(&self) -> Result<HashMap<String, bool>, AppError> {
            self.result.clone().map_err(AppError::Validation)
        }
    }

    #[derive(Default)]
    struct FakeHostsStore {
        blocked: Mutex<Vec<String>>,
    }

    #[async_trait]
    impl HostsFileStore for FakeHostsStore {
        async fn read_blocked_codes(&self) -> Result<Vec<String>, AppError> {
            Ok(self.blocked.lock().unwrap().clone())
        }

        async fn apply_blocked_codes(&self, codes: &[String]) -> Result<(), AppError> {
            *self.blocked.lock().unwrap() = codes.to_vec();
            Ok(())
        }
    }

    #[tokio::test]
    async fn list_regions_merges_online_status_and_blocked_state() {
        let mut statuses = HashMap::new();
        statuses.insert("us-east-1".to_string(), true);
        let status_provider = Arc::new(FakeStatusProvider { result: Ok(statuses) });
        let hosts = Arc::new(FakeHostsStore::default());
        hosts.apply_blocked_codes(&["us-east-1".to_string()]).await.unwrap();

        let service = RegionControlService::new(status_provider, hosts);
        let regions = service.list_regions().await.unwrap();

        let us_east = regions.iter().find(|r| r.code == "us-east-1").unwrap();
        assert_eq!(us_east.online, Some(true));
        assert!(us_east.blocked);

        let us_west = regions.iter().find(|r| r.code == "us-west-1").unwrap();
        assert!(!us_west.blocked);
    }

    #[tokio::test]
    async fn list_regions_survives_a_failed_status_fetch() {
        let status_provider = Arc::new(FakeStatusProvider { result: Err("network down".into()) });
        let hosts = Arc::new(FakeHostsStore::default());

        let service = RegionControlService::new(status_provider, hosts);
        let regions = service.list_regions().await.unwrap();

        assert_eq!(regions.len(), 15);
        assert!(regions.iter().all(|r| r.online.is_none()));
    }

    #[tokio::test]
    async fn set_blocked_regions_drops_unknown_codes() {
        let status_provider = Arc::new(FakeStatusProvider { result: Ok(HashMap::new()) });
        let hosts = Arc::new(FakeHostsStore::default());
        let service = RegionControlService::new(status_provider, hosts.clone());

        service
            .set_blocked_regions(vec!["us-east-1".to_string(), "not-a-real-region".to_string()])
            .await
            .unwrap();

        let stored = hosts.read_blocked_codes().await.unwrap();
        assert_eq!(stored, vec!["us-east-1".to_string()]);
    }
}
