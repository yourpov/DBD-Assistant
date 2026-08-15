use super::service::GameControlsService;
use crate::error::AppError;
use crate::ports::{GameInstall, GameManifestReader, ProcessLauncher, ProcessMonitor};
use async_trait::async_trait;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

#[derive(Default)]
struct FakeManifestReader {
    install: Option<&'static str>,
}

impl GameManifestReader for FakeManifestReader {
    fn find_install(&self, _display_name: &str) -> Result<Option<GameInstall>, AppError> {
        Ok(self.install.map(|platform| GameInstall {
            platform: platform.into(),
            install_location: "C:\\Games\\DeadByDaylight".into(),
            executable: "C:\\Games\\DeadByDaylight\\DeadByDaylight.exe".into(),
            version: "1.0.0".into(),
            launch_uri: "com.epicgames.launcher://apps/test".into(),
        }))
    }
}

#[derive(Default)]
struct FakeMonitor {
    running: AtomicBool,
}

#[async_trait]
impl ProcessMonitor for FakeMonitor {
    async fn is_running(&self, _process_name: &str) -> bool {
        self.running.load(Ordering::SeqCst)
    }

    async fn kill_all(&self, _process_name: &str) -> Result<(), AppError> {
        self.running.store(false, Ordering::SeqCst);
        Ok(())
    }
}

#[derive(Default)]
struct FakeLauncher {
    launched_uri: std::sync::Mutex<Option<String>>,
}

#[async_trait]
impl ProcessLauncher for FakeLauncher {
    async fn launch_uri(&self, uri: &str) -> Result<(), AppError> {
        *self.launched_uri.lock().unwrap() = Some(uri.to_string());
        Ok(())
    }
}

#[tokio::test]
async fn close_game_reflects_in_is_running() {
    let monitor = Arc::new(FakeMonitor { running: AtomicBool::new(true) });
    let launcher = Arc::new(FakeLauncher::default());
    let manifest_readers: Vec<Arc<dyn GameManifestReader>> = vec![Arc::new(FakeManifestReader::default())];
    let service = GameControlsService::new(monitor.clone(), launcher, manifest_readers);

    assert!(monitor.is_running("daylight").await);
    service.close_game().await.unwrap();
    assert!(!monitor.is_running("daylight").await);
}

#[tokio::test]
async fn game_info_reports_not_installed_when_no_manifest_matches() {
    let monitor = Arc::new(FakeMonitor::default());
    let launcher = Arc::new(FakeLauncher::default());
    let manifest_readers: Vec<Arc<dyn GameManifestReader>> =
        vec![Arc::new(FakeManifestReader::default()), Arc::new(FakeManifestReader::default())];
    let service = GameControlsService::new(monitor, launcher, manifest_readers);

    let info = service.game_info().await.unwrap();
    assert!(!info.installed);
    assert_eq!(info.platform, "Unknown");
}

#[tokio::test]
async fn game_info_reports_installed_when_first_manifest_matches() {
    let monitor = Arc::new(FakeMonitor::default());
    let launcher = Arc::new(FakeLauncher::default());
    let manifest_readers: Vec<Arc<dyn GameManifestReader>> =
        vec![Arc::new(FakeManifestReader { install: Some("Epic Games") }), Arc::new(FakeManifestReader::default())];
    let service = GameControlsService::new(monitor, launcher, manifest_readers);

    let info = service.game_info().await.unwrap();
    assert!(info.installed);
    assert_eq!(info.platform, "Epic Games");
    assert_eq!(info.version, "1.0.0");
}

#[tokio::test]
async fn game_info_falls_back_to_the_next_reader_when_the_first_finds_nothing() {
    let monitor = Arc::new(FakeMonitor::default());
    let launcher = Arc::new(FakeLauncher::default());
    let manifest_readers: Vec<Arc<dyn GameManifestReader>> =
        vec![Arc::new(FakeManifestReader::default()), Arc::new(FakeManifestReader { install: Some("Steam") })];
    let service = GameControlsService::new(monitor, launcher, manifest_readers);

    let info = service.game_info().await.unwrap();
    assert!(info.installed);
    assert_eq!(info.platform, "Steam");
}
