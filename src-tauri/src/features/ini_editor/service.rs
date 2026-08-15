use super::model::{GameClient, IniFilesResponse, IniSection, OpenIniResponse};
use crate::error::AppError;
use ini::Ini;
use std::path::{Path, PathBuf};

const INI_EXTENSION: &str = "ini";

pub struct IniEditorService {
    windows_config_path: PathBuf,
    egs_config_path: PathBuf,
    open_file_path: Option<PathBuf>,
}

impl IniEditorService {
    pub fn new(windows_path: String, egs_path: String) -> Self {
        Self {
            windows_config_path: PathBuf::from(windows_path),
            egs_config_path: PathBuf::from(egs_path),
            open_file_path: None,
        }
    }

    pub fn list_ini_files(&self) -> Result<IniFilesResponse, AppError> {
        Ok(IniFilesResponse {
            windows: scan_ini_dir(self.config_path(GameClient::Windows))?,
            egs: scan_ini_dir(self.config_path(GameClient::Egs))?,
        })
    }

    pub fn open_ini(&mut self, client: GameClient, filename: &str) -> Result<OpenIniResponse, AppError> {
        let path = self.config_path(client).join(validated_filename(filename)?);
        if !path.exists() {
            return Err(AppError::Validation(format!("{filename} is no longer in the {} folder", client.label())));
        }

        let sections = read_sections(&path)?;
        self.open_file_path = Some(path);
        Ok(OpenIniResponse { client, filename: filename.to_string(), sections })
    }

    pub fn save_section(&self, section_name: &str, key_values: Vec<(String, String)>) -> Result<(), AppError> {
        let path = self.open_path()?;
        let mut ini = Ini::load_from_file(path)?;
        for (key, value) in key_values {
            ini.set_to(Some(section_name), key, value);
        }
        ini.write_to_file(path).map_err(AppError::Io)
    }

    pub fn apply_audio_presets(&self) -> Result<(), AppError> {
        let path = self.open_path()?;
        let mut ini = Ini::load_from_file(path)?;

        ini.set_to(Some("Audio"), "iAudioQualityLevel".into(), "5".into());
        ini.set_to(Some("AudioQuality"), "eAudioQuality".into(), "High".into());

        ini.write_to_file(path).map_err(AppError::Io)
    }

    pub fn config_folder_path(&self) -> String {
        self.open_file_path
            .as_deref()
            .and_then(Path::parent)
            .unwrap_or(&self.windows_config_path)
            .to_string_lossy()
            .into_owned()
    }

    fn config_path(&self, client: GameClient) -> &Path {
        match client {
            GameClient::Windows => &self.windows_config_path,
            GameClient::Egs => &self.egs_config_path,
        }
    }

    fn open_path(&self) -> Result<&Path, AppError> {
        self.open_file_path
            .as_deref()
            .ok_or_else(|| AppError::Validation("No config file is open".into()))
    }
}

fn validated_filename(filename: &str) -> Result<&str, AppError> {
    let looks_like_a_path = filename.contains(['/', '\\']) || filename.contains("..");
    let is_ini = Path::new(filename).extension().is_some_and(|ext| ext.eq_ignore_ascii_case(INI_EXTENSION));
    if filename.is_empty() || looks_like_a_path || !is_ini {
        return Err(AppError::Validation(format!("{filename} is not a config file name")));
    }
    Ok(filename)
}

fn scan_ini_dir(config_path: &Path) -> Result<Vec<String>, AppError> {
    if !config_path.exists() {
        return Ok(Vec::new());
    }

    let mut files = Vec::new();
    for entry in std::fs::read_dir(config_path)? {
        let entry = entry?;
        let entry_path = entry.path();
        if !entry_path.is_file() || !entry_path.extension().is_some_and(|e| e == INI_EXTENSION) {
            continue;
        }
        files.push(entry.file_name().to_string_lossy().into_owned());
    }
    files.sort();
    Ok(files)
}

fn read_sections(path: &Path) -> Result<Vec<IniSection>, AppError> {
    let ini = Ini::load_from_file(path)?;
    Ok(ini
        .iter()
        .map(|(section, props)| IniSection {
            name: section.unwrap_or("").to_string(),
            keys: props.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect(),
        })
        .collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    struct TestConfigDirs {
        windows: PathBuf,
        egs: PathBuf,
    }

    impl TestConfigDirs {
        fn new(name: &str) -> Self {
            let root = std::env::temp_dir().join(format!("dbd-assistant-test-{name}"));
            let dirs = Self { windows: root.join("WindowsClient"), egs: root.join("EGSClient") };
            let _ = std::fs::remove_dir_all(&root);
            std::fs::create_dir_all(&dirs.windows).unwrap();
            std::fs::create_dir_all(&dirs.egs).unwrap();
            dirs
        }

        fn service(&self) -> IniEditorService {
            IniEditorService::new(
                self.windows.to_string_lossy().into_owned(),
                self.egs.to_string_lossy().into_owned(),
            )
        }
    }

    fn read_back(path: &Path, section: &str, key: &str) -> Option<String> {
        Ini::load_from_file(path).unwrap().get_from(Some(section), key).map(str::to_string)
    }

    #[test]
    fn missing_config_folders_list_as_empty() {
        let service = IniEditorService::new("Z:\\does-not-exist".into(), "Z:\\also-missing".into());
        let files = service.list_ini_files().unwrap();
        assert!(files.windows.is_empty());
        assert!(files.egs.is_empty());
    }

    #[test]
    fn lists_each_client_folder_separately() {
        let dirs = TestConfigDirs::new("list");
        std::fs::write(dirs.windows.join("Engine.ini"), "[Audio]\niAudioQualityLevel=1\n").unwrap();
        std::fs::write(dirs.egs.join("GameUserSettings.ini"), "[Audio]\niAudioQualityLevel=1\n").unwrap();

        let files = dirs.service().list_ini_files().unwrap();

        assert_eq!(files.windows, vec!["Engine.ini".to_string()]);
        assert_eq!(files.egs, vec!["GameUserSettings.ini".to_string()]);
    }

    #[test]
    fn same_filename_in_both_clients_opens_the_requested_client() {
        let dirs = TestConfigDirs::new("collision");
        std::fs::write(dirs.windows.join("Engine.ini"), "[Audio]\niAudioQualityLevel=1\n").unwrap();
        std::fs::write(dirs.egs.join("Engine.ini"), "[Audio]\niAudioQualityLevel=9\n").unwrap();
        let mut service = dirs.service();

        let opened = service.open_ini(GameClient::Egs, "Engine.ini").unwrap();

        assert_eq!(opened.client, GameClient::Egs);
        let audio = opened.sections.iter().find(|s| s.name == "Audio").unwrap();
        assert!(audio.keys.contains(&("iAudioQualityLevel".to_string(), "9".to_string())));
    }

    #[test]
    fn saving_writes_to_the_client_that_was_opened() {
        let dirs = TestConfigDirs::new("save-client");
        std::fs::write(dirs.windows.join("Engine.ini"), "[Audio]\niAudioQualityLevel=1\n").unwrap();
        std::fs::write(dirs.egs.join("Engine.ini"), "[Audio]\niAudioQualityLevel=1\n").unwrap();
        let mut service = dirs.service();

        service.open_ini(GameClient::Egs, "Engine.ini").unwrap();
        service.save_section("Audio", vec![("iAudioQualityLevel".into(), "5".into())]).unwrap();

        assert_eq!(read_back(&dirs.egs.join("Engine.ini"), "Audio", "iAudioQualityLevel"), Some("5".into()));
        assert_eq!(read_back(&dirs.windows.join("Engine.ini"), "Audio", "iAudioQualityLevel"), Some("1".into()));
    }

    #[test]
    fn saving_without_an_open_file_is_rejected() {
        let dirs = TestConfigDirs::new("save-unopened");
        let service = dirs.service();

        let error = service.save_section("Audio", vec![]).unwrap_err();

        assert!(matches!(error, AppError::Validation(_)));
    }

    #[test]
    fn audio_presets_only_write_real_audio_keys() {
        let dirs = TestConfigDirs::new("presets");
        let path = dirs.windows.join("Engine.ini");
        std::fs::write(&path, "[Audio]\niAudioQualityLevel=1\n").unwrap();
        let mut service = dirs.service();

        service.open_ini(GameClient::Windows, "Engine.ini").unwrap();
        service.apply_audio_presets().unwrap();

        assert_eq!(read_back(&path, "Audio", "iAudioQualityLevel"), Some("5".into()));
        assert_eq!(read_back(&path, "AudioQuality", "eAudioQuality"), Some("High".into()));
        assert!(!std::fs::read_to_string(&path).unwrap().contains("con.Var"));
    }

    #[test]
    fn filenames_may_not_escape_the_config_folder() {
        let dirs = TestConfigDirs::new("traversal");
        let mut service = dirs.service();

        for attempt in ["..\\..\\hosts.ini", "sub/Engine.ini", "Engine.txt", ""] {
            assert!(matches!(
                service.open_ini(GameClient::Windows, attempt).unwrap_err(),
                AppError::Validation(_)
            ));
        }
    }

    #[test]
    fn config_folder_path_follows_the_open_file() {
        let dirs = TestConfigDirs::new("folder-path");
        std::fs::write(dirs.egs.join("Engine.ini"), "[Audio]\niAudioQualityLevel=1\n").unwrap();
        let mut service = dirs.service();

        assert_eq!(service.config_folder_path(), dirs.windows.to_string_lossy());
        service.open_ini(GameClient::Egs, "Engine.ini").unwrap();
        assert_eq!(service.config_folder_path(), dirs.egs.to_string_lossy());
    }
}
