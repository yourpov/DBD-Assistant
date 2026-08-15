use super::model::AppCredit;
use super::service::AboutService;
use tauri::State;

#[tauri::command]
pub async fn get_app_credit(
    state: State<'_, AboutService>,
    discord_user_id: String,
) -> Result<AppCredit, String> {
    state.credit(&discord_user_id).await.map_err(String::from)
}
