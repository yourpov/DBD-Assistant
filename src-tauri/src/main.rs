#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() >= 3 && args[1] == "--apply-hosts-file" {
        let staged_path = &args[2];
        let result = dbd_assistant_lib::infrastructure::hosts_file::apply_staged_file_elevated(staged_path);
        if let Err(e) = &result {
            let sidecar = dbd_assistant_lib::infrastructure::hosts_file::error_sidecar_path(std::path::Path::new(staged_path));
            let _ = std::fs::write(sidecar, e.to_string());
        }
        std::process::exit(if result.is_ok() { 0 } else { 1 });
    }

    dbd_assistant_lib::run();
}
