use crate::error::AppError;
use crate::ports::{GameInstall, GameManifestReader};
use serde::Deserialize;
use std::path::{Path, PathBuf};

#[derive(Deserialize)]
struct EpicManifestFile {
    #[serde(rename = "DisplayName")]
    display_name: String,
    #[serde(rename = "AppName")]
    app_name: String,
    #[serde(rename = "CatalogNamespace")]
    catalog_namespace: String,
    #[serde(rename = "CatalogItemId")]
    catalog_item_id: String,
    #[serde(rename = "InstallLocation")]
    install_location: String,
    #[serde(rename = "LaunchExecutable")]
    launch_executable: String,
    #[serde(rename = "AppVersionString")]
    app_version: String,
}

const MANIFESTS_DIR: &str = r"C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests";

pub struct WindowsEpicManifestReader;

impl GameManifestReader for WindowsEpicManifestReader {
    fn find_install(&self, display_name: &str) -> Result<Option<GameInstall>, AppError> {
        find_install(display_name)
    }
}

fn short_version(raw: &str) -> String {
    let numeric_segment = raw
        .split('_')
        .rev()
        .find(|s| !s.is_empty() && s.chars().all(|c| c.is_ascii_digit() || c == '.'));

    match numeric_segment {
        Some(segment) => segment.split('.').take(3).collect::<Vec<_>>().join("."),
        None => raw.to_string(),
    }
}

fn find_install(display_name: &str) -> Result<Option<GameInstall>, AppError> {
    let dir = Path::new(MANIFESTS_DIR);
    if !dir.exists() {
        return Ok(None);
    }

    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("item") {
            continue;
        }

        let contents = std::fs::read_to_string(&path)?;
        let Ok(manifest) = serde_json::from_str::<EpicManifestFile>(&contents) else {
            continue;
        };

        if manifest.display_name != display_name {
            continue;
        }

        let install_location = PathBuf::from(&manifest.install_location);
        return Ok(Some(GameInstall {
            platform: "Epic Games".into(),
            executable: install_location.join(&manifest.launch_executable),
            install_location,
            version: short_version(&manifest.app_version),
            launch_uri: format!(
                "com.epicgames.launcher://apps/{}%3A{}%3A{}?action=launch&silent=true",
                manifest.catalog_namespace, manifest.catalog_item_id, manifest.app_name
            ),
        }));
    }

    Ok(None)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_internal_build_string_down_to_x_y_z() {
        assert_eq!(short_version("DBD_Sushi_HF3_EGS_Shipping_4_3527957_10.0.3.2"), "10.0.3");
    }

    #[test]
    fn leaves_a_bare_version_unchanged() {
        assert_eq!(short_version("10.0.3"), "10.0.3");
    }

    #[test]
    fn falls_back_to_the_raw_string_when_nothing_numeric_is_found() {
        assert_eq!(short_version("unknown-build"), "unknown-build");
    }
}
