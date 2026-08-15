use super::model::GameInfo;
use crate::error::AppError;
use crate::ports::{GameInstall, GameManifestReader, ProcessLauncher, ProcessMonitor};
use std::sync::Arc;

const DISPLAY_NAME: &str = "Dead by Daylight";
const PROCESS_NAME_FRAGMENT: &str = "daylight";
const RESTART_SETTLE_DELAY: std::time::Duration = std::time::Duration::from_secs(2);

pub struct GameControlsService {
    monitor: Arc<dyn ProcessMonitor>,
    launcher: Arc<dyn ProcessLauncher>,
    manifest_readers: Vec<Arc<dyn GameManifestReader>>,
}

impl GameControlsService {
    pub fn new(
        monitor: Arc<dyn ProcessMonitor>,
        launcher: Arc<dyn ProcessLauncher>,
        manifest_readers: Vec<Arc<dyn GameManifestReader>>,
    ) -> Self {
        Self { monitor, launcher, manifest_readers }
    }

    fn find_install(&self) -> Result<Option<GameInstall>, AppError> {
        for reader in &self.manifest_readers {
            if let Some(install) = reader.find_install(DISPLAY_NAME)? {
                return Ok(Some(install));
            }
        }
        Ok(None)
    }

    pub async fn game_info(&self) -> Result<GameInfo, AppError> {
        let running = self.monitor.is_running(PROCESS_NAME_FRAGMENT).await;

        let Some(install) = self.find_install()? else {
            let mut info = GameInfo::not_installed();
            info.running = running;
            return Ok(info);
        };

        Ok(GameInfo {
            installed: true,
            running,
            platform: install.platform,
            display_name: DISPLAY_NAME.into(),
            version: install.version,
            install_location: install.install_location.display().to_string(),
            executable: install.executable.display().to_string(),
        })
    }

    pub async fn start_game(&self) -> Result<(), AppError> {
        let install = self
            .find_install()?
            .ok_or_else(|| AppError::Validation("Dead by Daylight is not installed via Epic Games or Steam".into()))?;
        self.launcher.launch_uri(&install.launch_uri).await
    }

    pub async fn close_game(&self) -> Result<(), AppError> {
        self.monitor.kill_all(PROCESS_NAME_FRAGMENT).await
    }

    pub async fn restart_game(&self) -> Result<(), AppError> {
        self.close_game().await?;
        tokio::time::sleep(RESTART_SETTLE_DELAY).await;
        self.start_game().await
    }
}
