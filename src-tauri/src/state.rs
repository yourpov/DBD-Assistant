use crate::features::ini_editor::service::IniEditorService;
use std::sync::Arc;
use tokio::sync::Mutex;

pub type IniEditorState = Arc<Mutex<IniEditorService>>;
