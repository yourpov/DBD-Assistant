use serde::Serialize;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GameInfo {
    pub installed: bool,
    pub running: bool,
    pub platform: String,
    pub display_name: String,
    pub version: String,
    pub install_location: String,
    pub executable: String,
}

impl GameInfo {
    pub fn not_installed() -> Self {
        Self {
            installed: false,
            running: false,
            platform: "Unknown".into(),
            display_name: "Dead by Daylight".into(),
            version: String::new(),
            install_location: String::new(),
            executable: String::new(),
        }
    }
}
