use crate::error::AppError;
use crate::infrastructure::region_data::{hostnames_for, REGIONS};
use crate::ports::{ElevatedRunner, HostsFileStore};
use async_trait::async_trait;
use std::path::{Path, PathBuf};
use std::sync::Arc;

const SECTION_START: &str = "# BEGIN DBD ASSISTANT REGION BLOCK";
const SECTION_END: &str = "# END DBD ASSISTANT REGION BLOCK";
const BLOCK_IP: &str = "0.0.0.0";

fn windows_hosts_path() -> PathBuf {
    PathBuf::from(r"C:\Windows\System32\drivers\etc\hosts")
}

fn build_updated_hosts_content(existing: &str, blocked_codes: &[String]) -> String {
    let mut lines: Vec<&str> = Vec::new();
    let mut in_section = false;
    for line in existing.lines() {
        if line.trim() == SECTION_START {
            in_section = true;
            continue;
        }
        if line.trim() == SECTION_END {
            in_section = false;
            continue;
        }
        if !in_section {
            lines.push(line);
        }
    }
    while lines.last().is_some_and(|l| l.trim().is_empty()) {
        lines.pop();
    }

    let mut out = lines.join("\n");
    if !out.is_empty() {
        out.push('\n');
    }

    if !blocked_codes.is_empty() {
        out.push('\n');
        out.push_str(SECTION_START);
        out.push('\n');
        for code in blocked_codes {
            for hostname in hostnames_for(code) {
                out.push_str(&format!("{BLOCK_IP} {hostname}\n"));
            }
        }
        out.push_str(SECTION_END);
        out.push('\n');
    }

    out
}

fn parse_blocked_codes(existing: &str) -> Vec<String> {
    let section = existing
        .split(SECTION_START)
        .nth(1)
        .and_then(|rest| rest.split(SECTION_END).next())
        .unwrap_or("");

    REGIONS
        .iter()
        .filter(|region| {
            hostnames_for(region.code)
                .iter()
                .any(|hostname| section.contains(&format!("{BLOCK_IP} {hostname}")))
        })
        .map(|region| region.code.to_string())
        .collect()
}

pub struct WindowsHostsFileStore {
    elevated_runner: Arc<dyn ElevatedRunner>,
    hosts_path: PathBuf,
}

impl WindowsHostsFileStore {
    pub fn new(elevated_runner: Arc<dyn ElevatedRunner>) -> Self {
        Self { elevated_runner, hosts_path: windows_hosts_path() }
    }

    fn read_file(path: &Path) -> Result<String, AppError> {
        std::fs::read_to_string(path).map_err(AppError::Io)
    }
}

#[async_trait]
impl HostsFileStore for WindowsHostsFileStore {
    async fn read_blocked_codes(&self) -> Result<Vec<String>, AppError> {
        let path = self.hosts_path.clone();
        tokio::task::spawn_blocking(move || {
            let content = Self::read_file(&path)?;
            Ok(parse_blocked_codes(&content))
        })
        .await
        .map_err(|e| AppError::Launch(format!("failed to read hosts file: {e}")))?
    }

    async fn apply_blocked_codes(&self, codes: &[String]) -> Result<(), AppError> {
        let path = self.hosts_path.clone();
        let codes = codes.to_vec();
        let staged_path = tokio::task::spawn_blocking(move || -> Result<PathBuf, AppError> {
            let existing = Self::read_file(&path)?;
            let updated = build_updated_hosts_content(&existing, &codes);
            let staged = std::env::temp_dir().join(format!("dbd-assistant-hosts-{}.tmp", std::process::id()));
            std::fs::write(&staged, updated).map_err(AppError::Io)?;
            Ok(staged)
        })
        .await
        .map_err(|e| AppError::Launch(format!("failed to stage hosts file update: {e}")))??;

        let result = self
            .elevated_runner
            .run_self_elevated(&["--apply-hosts-file", &staged_path.to_string_lossy()])
            .await;

        let error_sidecar = error_sidecar_path(&staged_path);
        let error_detail = std::fs::read_to_string(&error_sidecar).ok().filter(|s| !s.trim().is_empty());
        let _ = std::fs::remove_file(&staged_path);
        let _ = std::fs::remove_file(&error_sidecar);

        if let (Err(AppError::Launch(msg)), Some(detail)) = (&result, &error_detail) {
            return Err(AppError::Launch(format!("{msg}: {}", detail.trim())));
        }
        result?;

        best_effort_flush_dns().await;
        Ok(())
    }
}

async fn best_effort_flush_dns() {
    let _ = tokio::process::Command::new("ipconfig").args(["/flushdns"]).output().await;
}

pub fn error_sidecar_path(staged_path: &Path) -> PathBuf {
    staged_path.with_extension("err")
}

fn clear_readonly_if_set(path: &Path) -> std::io::Result<()> {
    let metadata = std::fs::metadata(path)?;
    let mut permissions = metadata.permissions();
    if permissions.readonly() {
        permissions.set_readonly(false);
        std::fs::set_permissions(path, permissions)?;
    }
    Ok(())
}

pub fn apply_staged_file_elevated(staged_path: &str) -> Result<(), std::io::Error> {
    let content = std::fs::read_to_string(staged_path)?;
    let hosts_path = windows_hosts_path();
    clear_readonly_if_set(&hosts_path)?;
    std::fs::write(&hosts_path, content)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn appends_section_when_none_exists() {
        let existing = "127.0.0.1 localhost\n";
        let updated = build_updated_hosts_content(existing, &["us-east-1".to_string()]);
        assert!(updated.contains("127.0.0.1 localhost"));
        assert!(updated.contains(SECTION_START));
        assert!(updated.contains("0.0.0.0 gamelift.us-east-1.amazonaws.com"));
        assert!(updated.contains("0.0.0.0 gamelift-ping.us-east-1.api.aws"));
        assert!(updated.contains(SECTION_END));
    }

    #[test]
    fn replaces_prior_section_without_touching_other_lines() {
        let existing = format!(
            "127.0.0.1 localhost\n\n{SECTION_START}\n0.0.0.0 gamelift.eu-west-1.amazonaws.com\n0.0.0.0 gamelift-ping.eu-west-1.api.aws\n{SECTION_END}\n"
        );
        let updated = build_updated_hosts_content(&existing, &["us-east-1".to_string()]);
        assert!(updated.contains("127.0.0.1 localhost"));
        assert!(!updated.contains("eu-west-1"));
        assert!(updated.contains("us-east-1"));
        assert_eq!(updated.matches(SECTION_START).count(), 1);
    }

    #[test]
    fn empty_blocked_list_removes_section_entirely() {
        let existing = format!("127.0.0.1 localhost\n\n{SECTION_START}\n0.0.0.0 gamelift.us-east-1.amazonaws.com\n{SECTION_END}\n");
        let updated = build_updated_hosts_content(&existing, &[]);
        assert!(!updated.contains(SECTION_START));
        assert!(updated.contains("127.0.0.1 localhost"));
    }

    #[test]
    fn parses_back_what_was_written() {
        let existing = build_updated_hosts_content("127.0.0.1 localhost\n", &["us-east-1".to_string(), "eu-west-1".to_string()]);
        let mut parsed = parse_blocked_codes(&existing);
        parsed.sort();
        assert_eq!(parsed, vec!["eu-west-1".to_string(), "us-east-1".to_string()]);
    }

    #[test]
    fn reapplying_does_not_grow_trailing_blank_lines() {
        let once = build_updated_hosts_content("127.0.0.1 localhost\n", &["us-east-1".to_string()]);
        let twice = build_updated_hosts_content(&once, &["us-east-1".to_string()]);
        assert_eq!(once, twice);
    }
}
