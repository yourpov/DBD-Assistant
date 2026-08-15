use crate::error::AppError;
use crate::ports::{GameInstall, GameManifestReader};
use std::path::{Path, PathBuf};

const STEAM_APP_ID: &str = "381210";
const STEAM_EXECUTABLE_NAME: &str = "DeadByDaylight.exe";

pub struct WindowsSteamManifestReader;

impl GameManifestReader for WindowsSteamManifestReader {
    fn find_install(&self, _display_name: &str) -> Result<Option<GameInstall>, AppError> {
        Ok(find_install())
    }
}

fn find_install() -> Option<GameInstall> {
    let steam_path = steam_install_path()?;

    for library in library_folders(&steam_path) {
        let manifest_path = library.join("steamapps").join(format!("appmanifest_{STEAM_APP_ID}.acf"));
        let Ok(contents) = std::fs::read_to_string(&manifest_path) else {
            continue;
        };
        let Some(install_dir) = vdf_value(&contents, "installdir") else {
            continue;
        };

        let build_id = vdf_value(&contents, "buildid");
        let install_location = library.join("steamapps").join("common").join(install_dir);
        return Some(GameInstall {
            platform: "Steam".into(),
            executable: install_location.join(STEAM_EXECUTABLE_NAME),
            install_location,
            version: build_id.map(|id| format!("build {id}")).unwrap_or_else(|| "Unknown".into()),
            launch_uri: format!("steam://rungameid/{STEAM_APP_ID}"),
        });
    }

    None
}

fn steam_install_path() -> Option<PathBuf> {
    read_registry_string(r"HKCU\Software\Valve\Steam", "SteamPath")
        .or_else(|| read_registry_string(r"HKLM\SOFTWARE\WOW6432Node\Valve\Steam", "InstallPath"))
}

fn read_registry_string(key_path: &str, value_name: &str) -> Option<PathBuf> {
    let output = std::process::Command::new("reg").args(["query", key_path, "/v", value_name]).output().ok()?;
    if !output.status.success() {
        return None;
    }
    let stdout = String::from_utf8_lossy(&output.stdout);
    let line = stdout.lines().find(|l| l.contains(value_name))?;
    let value = line.split("REG_SZ").nth(1)?.trim();
    (!value.is_empty()).then(|| PathBuf::from(value))
}

fn library_folders(steam_path: &Path) -> Vec<PathBuf> {
    let vdf_path = steam_path.join("steamapps").join("libraryfolders.vdf");
    let mut libraries = vec![steam_path.to_path_buf()];

    if let Ok(contents) = std::fs::read_to_string(&vdf_path) {
        for path in vdf_values(&contents, "path").into_iter().map(PathBuf::from) {
            if !libraries.contains(&path) {
                libraries.push(path);
            }
        }
    }

    libraries
}

fn vdf_values(contents: &str, key: &str) -> Vec<String> {
    let key_quoted = format!("\"{key}\"");
    contents
        .lines()
        .filter_map(|line| {
            let rest = line.trim().strip_prefix(&key_quoted)?.trim_start();
            let value = rest.strip_prefix('"')?;
            let end = value.find('"')?;
            Some(value[..end].replace("\\\\", "\\"))
        })
        .collect()
}

fn vdf_value(contents: &str, key: &str) -> Option<String> {
    vdf_values(contents, key).into_iter().next()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_all_library_paths_from_libraryfolders_vdf() {
        let vdf = "\"libraryfolders\"\n{\n\t\"0\"\n\t{\n\t\t\"path\"\t\t\"C:\\\\Program Files (x86)\\\\Steam\"\n\t\t\"apps\"\n\t\t{\n\t\t\t\"381210\"\t\t\"12345678900\"\n\t\t}\n\t}\n\t\"1\"\n\t{\n\t\t\"path\"\t\t\"D:\\\\SteamLibrary\"\n\t\t\"apps\"\n\t\t{\n\t\t}\n\t}\n}\n";
        assert_eq!(
            vdf_values(vdf, "path"),
            vec!["C:\\Program Files (x86)\\Steam".to_string(), "D:\\SteamLibrary".to_string()]
        );
    }

    #[test]
    fn extracts_installdir_and_buildid_from_appmanifest() {
        let acf = "\"AppState\"\n{\n\t\"appid\"\t\t\"381210\"\n\t\"name\"\t\t\"Dead by Daylight\"\n\t\"installdir\"\t\t\"dead by daylight\"\n\t\"buildid\"\t\t\"18452617\"\n}\n";
        assert_eq!(vdf_value(acf, "installdir"), Some("dead by daylight".to_string()));
        assert_eq!(vdf_value(acf, "buildid"), Some("18452617".to_string()));
    }

    #[test]
    fn missing_key_returns_none() {
        let acf = "\"AppState\"\n{\n\t\"appid\"\t\t\"381210\"\n}\n";
        assert_eq!(vdf_value(acf, "installdir"), None);
    }
}
