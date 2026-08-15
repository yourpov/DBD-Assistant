use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum GameClient {
    Windows,
    Egs,
}

impl GameClient {
    pub fn label(self) -> &'static str {
        match self {
            GameClient::Windows => "WindowsClient",
            GameClient::Egs => "EGSClient",
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct IniSection {
    pub name: String,
    pub keys: Vec<(String, String)>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct IniFilesResponse {
    pub windows: Vec<String>,
    pub egs: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct OpenIniResponse {
    pub client: GameClient,
    pub filename: String,
    pub sections: Vec<IniSection>,
}
