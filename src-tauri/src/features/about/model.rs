use serde::Serialize;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppCredit {
    pub username: String,
    pub display_name: String,
    pub avatar_data_url: String,
    pub decoration_data_url: Option<String>,
    pub status: String,
    pub activity_text: Option<String>,
}
