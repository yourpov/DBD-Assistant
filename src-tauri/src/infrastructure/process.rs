use crate::error::AppError;
use crate::ports::{ProcessLauncher, ProcessMonitor};
use async_trait::async_trait;
use std::os::windows::ffi::OsStrExt;
use std::sync::{LazyLock, Mutex, MutexGuard};
use sysinfo::{ProcessesToUpdate, System};

const SW_SHOWNORMAL: i32 = 1;
const COINIT_APARTMENTTHREADED: u32 = 0x2;
const SHELL_EXECUTE_MIN_SUCCESS: isize = 32;

#[link(name = "shell32")]
extern "system" {
    fn ShellExecuteW(
        hwnd: *mut core::ffi::c_void,
        operation: *const u16,
        file: *const u16,
        parameters: *const u16,
        directory: *const u16,
        show_cmd: i32,
    ) -> isize;
}

#[link(name = "ole32")]
extern "system" {
    fn CoInitializeEx(reserved: *mut core::ffi::c_void, coinit: u32) -> i32;
    fn CoUninitialize();
}

fn to_wide(s: &str) -> Vec<u16> {
    std::ffi::OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

static PROCESS_TABLE: LazyLock<Mutex<System>> = LazyLock::new(|| Mutex::new(System::new()));

fn lock_process_table() -> MutexGuard<'static, System> {
    PROCESS_TABLE.lock().unwrap_or_else(|poisoned| poisoned.into_inner())
}

fn matches_name(process: &sysinfo::Process, name: &str) -> bool {
    process
        .name()
        .to_string_lossy()
        .to_lowercase()
        .contains(&name.to_lowercase())
}

pub struct SysinfoProcessMonitor;

#[async_trait]
impl ProcessMonitor for SysinfoProcessMonitor {
    async fn is_running(&self, process_name: &str) -> bool {
        let process_name = process_name.to_string();
        tokio::task::spawn_blocking(move || {
            let mut system = lock_process_table();
            system.refresh_processes(ProcessesToUpdate::All, true);
            system.processes().values().any(|p| matches_name(p, &process_name))
        })
        .await
        .unwrap_or(false)
    }

    async fn kill_all(&self, process_name: &str) -> Result<(), AppError> {
        let process_name = process_name.to_string();
        tokio::task::spawn_blocking(move || {
            let mut system = lock_process_table();
            system.refresh_processes(ProcessesToUpdate::All, true);
            for process in system.processes().values().filter(|p| matches_name(p, &process_name)) {
                process.kill();
            }
        })
        .await
        .map_err(|e| AppError::Launch(format!("failed to enumerate processes: {e}")))
    }
}

pub struct WindowsLauncher;

#[async_trait]
impl ProcessLauncher for WindowsLauncher {
    async fn launch_uri(&self, uri: &str) -> Result<(), AppError> {
        let uri = uri.to_string();
        tokio::task::spawn_blocking(move || {
            let operation = to_wide("open");
            let file = to_wide(&uri);
            unsafe {
                CoInitializeEx(std::ptr::null_mut(), COINIT_APARTMENTTHREADED);
            }
            let code = unsafe {
                ShellExecuteW(
                    std::ptr::null_mut(),
                    operation.as_ptr(),
                    file.as_ptr(),
                    std::ptr::null(),
                    std::ptr::null(),
                    SW_SHOWNORMAL,
                )
            };
            unsafe {
                CoUninitialize();
            }
            if code > SHELL_EXECUTE_MIN_SUCCESS {
                Ok(())
            } else {
                Err(AppError::Launch(format!("failed to open {uri} (ShellExecute error {code})")))
            }
        })
        .await
        .map_err(|e| AppError::Launch(format!("launch task join failed: {e}")))?
    }
}
