use crate::error::AppError;
use crate::ports::ElevatedRunner;
use async_trait::async_trait;
use std::os::windows::ffi::OsStrExt;

const SW_HIDE: i32 = 0;
const SEE_MASK_NOCLOSEPROCESS: u32 = 0x0000_0040;
const SEE_MASK_NOASYNC: u32 = 0x0000_0100;
const WAIT_TIMEOUT_MS: u32 = 60_000;
const WAIT_OBJECT_0: u32 = 0;

#[repr(C)]
struct ShellExecuteInfoW {
    cb_size: u32,
    f_mask: u32,
    hwnd: *mut core::ffi::c_void,
    lp_verb: *const u16,
    lp_file: *const u16,
    lp_parameters: *const u16,
    lp_directory: *const u16,
    n_show: i32,
    h_inst_app: isize,
    lp_id_list: *mut core::ffi::c_void,
    lp_class: *const u16,
    hkey_class: *mut core::ffi::c_void,
    dw_hot_key: u32,
    h_icon_or_monitor: *mut core::ffi::c_void,
    h_process: *mut core::ffi::c_void,
}

#[link(name = "shell32")]
extern "system" {
    fn ShellExecuteExW(info: *mut ShellExecuteInfoW) -> i32;
}

#[link(name = "kernel32")]
extern "system" {
    fn WaitForSingleObject(handle: *mut core::ffi::c_void, milliseconds: u32) -> u32;
    fn GetExitCodeProcess(handle: *mut core::ffi::c_void, exit_code: *mut u32) -> i32;
    fn CloseHandle(handle: *mut core::ffi::c_void) -> i32;
}

fn to_wide(s: &str) -> Vec<u16> {
    std::ffi::OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

fn quote_arg(arg: &str) -> String {
    format!("\"{}\"", arg.replace('"', "\\\""))
}

pub struct WindowsElevatedRunner;

#[async_trait]
impl ElevatedRunner for WindowsElevatedRunner {
    async fn run_self_elevated(&self, args: &[&str]) -> Result<(), AppError> {
        let exe = std::env::current_exe().map_err(AppError::Io)?;
        let parameters = args.iter().map(|a| quote_arg(a)).collect::<Vec<_>>().join(" ");

        tokio::task::spawn_blocking(move || run_and_wait(&exe.to_string_lossy(), &parameters))
            .await
            .map_err(|e| AppError::Launch(format!("elevated task join failed: {e}")))?
    }
}

fn run_and_wait(program: &str, parameters: &str) -> Result<(), AppError> {
    let operation = to_wide("runas");
    let file = to_wide(program);
    let params = to_wide(parameters);

    let mut info: ShellExecuteInfoW = unsafe { std::mem::zeroed() };
    info.cb_size = std::mem::size_of::<ShellExecuteInfoW>() as u32;
    info.f_mask = SEE_MASK_NOCLOSEPROCESS | SEE_MASK_NOASYNC;
    info.lp_verb = operation.as_ptr();
    info.lp_file = file.as_ptr();
    info.lp_parameters = params.as_ptr();
    info.n_show = SW_HIDE;

    let started = unsafe { ShellExecuteExW(&mut info) };
    if started == 0 {
        return Err(AppError::Launch("admin prompt declined or blocked".into()));
    }
    if info.h_process.is_null() {
        return Err(AppError::Launch("elevated process handle unavailable".into()));
    }

    let mut exit_code: u32 = 1;
    unsafe {
        let wait_result = WaitForSingleObject(info.h_process, WAIT_TIMEOUT_MS);
        if wait_result == WAIT_OBJECT_0 {
            GetExitCodeProcess(info.h_process, &mut exit_code);
        }
        CloseHandle(info.h_process);
    }

    if exit_code == 0 {
        Ok(())
    } else {
        Err(AppError::Launch(format!("elevated operation failed (exit code {exit_code})")))
    }
}
