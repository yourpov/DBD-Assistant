use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("INI parsing failed: {0}")]
    IniParse(#[from] ini::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON parsing failed: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("{0}")]
    Launch(String),
}

impl From<AppError> for String {
    fn from(err: AppError) -> Self {
        err.to_string()
    }
}
