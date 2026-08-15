use serde::Serialize;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Region {
    pub code: String,
    pub name: String,
    pub area: String,
    pub online: Option<bool>,
    pub blocked: bool,
}
